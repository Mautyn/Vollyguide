"""Detecting and tracking players in a video, frame by frame.

The detector is passed in, so the loop can be tested with a fake one. The real detector
(YOLO + ByteTrack from `ultralytics`) is created by `yolo_detector` and needs the optional
`track` dependencies; it is never imported by the tests.
"""

from __future__ import annotations

import sys
import time
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

from .calibration import Calibration
from .tracks import CourtArea, Tracks


@dataclass(frozen=True)
class Box:
    """A tracked person in one frame: pixel box, tracker id, detection confidence."""

    x1: float
    y1: float
    x2: float
    y2: float
    track_id: int
    confidence: float

    @property
    def feet(self) -> tuple[float, float]:
        """Bottom centre of the box: where the feet touch the floor."""
        return (self.x1 + self.x2) / 2, self.y2


Detector = Callable[[np.ndarray], list[Box]]


def sampled_frames(
    path: Path, fps: float, start_s: float = 0.0, end_s: float | None = None
) -> Iterator[tuple[int, float, np.ndarray]]:
    """(frame index, time, image) at about `fps` frames per second. Skipped frames are only
    grabbed, not decoded into images, which keeps long 4K videos fast."""
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise ValueError(f"Could not open video {path}")
    try:
        video_fps = capture.get(cv2.CAP_PROP_FPS) or 25.0
        step = max(1, round(video_fps / fps))
        first = int(round(start_s * video_fps))
        if first:
            capture.set(cv2.CAP_PROP_POS_FRAMES, first)
        index = first
        while True:
            t = index / video_fps
            if end_s is not None and t > end_s:
                return
            if (index - first) % step == 0:
                ok, image = capture.read()
                if not ok:
                    return
                yield index, t, image
            elif not capture.grab():
                return
            index += 1
    finally:
        capture.release()


def track_video(
    path: Path,
    calibration: Calibration,
    detector: Detector,
    fps: float = 10.0,
    area: CourtArea | None = None,
    start_s: float = 0.0,
    end_s: float | None = None,
    progress: Callable[[float], None] | None = None,
) -> Tracks:
    """Runs the detector on sampled frames and keeps the analysed team's players, with
    their feet in court meters (the analysed team's frame, following side changes)."""
    area = area or CourtArea()
    rows: list[tuple[float, ...]] = []
    for index, t, image in sampled_frames(path, fps, start_s, end_s):
        boxes = detector(image)
        if progress:
            progress(t)
        if not boxes:
            continue
        feet = np.array([b.feet for b in boxes])
        court = calibration.to_court(feet, time_s=t)
        keep = area.contains(court[:, 0], court[:, 1])
        for box, (x, y), kept in zip(boxes, court, keep, strict=True):
            if kept:
                rows.append(
                    (t, index, box.track_id, x, y, box.confidence, box.x1, box.y1, box.x2, box.y2)
                )
    return Tracks.from_rows(rows)


def pick_device(requested: str = "auto") -> str:
    """ "cuda" when an NVIDIA GPU is usable, otherwise "cpu" (with a warning)."""
    import torch

    if requested == "cpu":
        return "cpu"
    if torch.cuda.is_available():
        return "cuda"
    print(
        "Warning: no usable NVIDIA GPU (CUDA) found; running on the CPU, which is much slower.",
        file=sys.stderr,
    )
    return "cpu"


def yolo_detector(
    model: str = "yolo11m.pt", device: str = "auto", imgsz: int = 1920, conf: float = 0.3
) -> Detector:  # pragma: no cover (needs the optional GPU dependencies and model weights)
    """YOLO person detection plus ByteTrack, from `ultralytics`."""
    from ultralytics import YOLO, settings

    # Ultralytics sends anonymous usage analytics by default. Nothing leaves this computer.
    settings.update({"sync": False})
    chosen = pick_device(device)
    yolo = YOLO(model)

    def detect(image: np.ndarray) -> list[Box]:
        result = yolo.track(
            image,
            persist=True,
            tracker="bytetrack.yaml",
            classes=[0],  # person
            conf=conf,
            imgsz=imgsz,
            device=chosen,
            verbose=False,
        )[0]
        boxes = result.boxes
        if boxes is None or boxes.id is None:
            return []
        xyxy = boxes.xyxy.cpu().numpy()
        ids = boxes.id.cpu().numpy().astype(int)
        confs = boxes.conf.cpu().numpy()
        return [
            Box(float(a), float(b), float(c), float(d), int(i), float(s))
            for (a, b, c, d), i, s in zip(xyxy, ids, confs, strict=True)
        ]

    detect.device = chosen  # type: ignore[attr-defined]
    return detect


class Progress:
    """Prints progress and speed about every 10 seconds of wall time."""

    def __init__(self, duration_s: float) -> None:
        self.duration_s = max(duration_s, 1e-9)
        self.started = time.monotonic()
        self.last = 0.0

    def __call__(self, t: float) -> None:
        now = time.monotonic()
        if now - self.last < 10:
            return
        self.last = now
        elapsed = now - self.started
        done = min(t / self.duration_s, 1.0)
        eta = elapsed / done - elapsed if done > 0 else float("nan")
        print(
            f"{done:6.1%}  video {t / 60:5.1f} min  elapsed {elapsed / 60:5.1f} min  "
            f"left ~{eta / 60:5.1f} min",
            flush=True,
        )
