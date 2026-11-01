"""Reading frames from a local video file."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np


@dataclass(frozen=True)
class VideoInfo:
    width: int
    height: int
    fps: float
    duration_s: float


def video_info(path: Path) -> VideoInfo:
    capture = _open(path)
    try:
        fps = capture.get(cv2.CAP_PROP_FPS) or 0.0
        frames = capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0.0
        return VideoInfo(
            width=int(capture.get(cv2.CAP_PROP_FRAME_WIDTH)),
            height=int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT)),
            fps=float(fps),
            duration_s=float(frames / fps) if fps else 0.0,
        )
    finally:
        capture.release()


def read_frame(path: Path, time_s: float) -> np.ndarray:
    """The frame at `time_s` seconds (BGR). Clamped to the last frame of the video."""
    capture = _open(path)
    try:
        fps = capture.get(cv2.CAP_PROP_FPS) or 25.0
        frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        index = max(0, round(time_s * fps))
        if frames:
            index = min(index, frames - 1)
        capture.set(cv2.CAP_PROP_POS_FRAMES, index)
        ok, frame = capture.read()
        if not ok or frame is None:
            raise ValueError(f"Could not read a frame at {time_s:.1f} s from {path}")
        return frame
    finally:
        capture.release()


def _open(path: Path) -> cv2.VideoCapture:
    if not path.is_file():
        raise FileNotFoundError(path)
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise ValueError(f"Could not open video {path}")
    return capture
