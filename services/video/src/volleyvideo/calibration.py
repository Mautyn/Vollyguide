"""Pixel ↔ court mapping for one video: radial lens distortion plus a homography.

The Veo panorama is stitched from wide lenses, so straight court lines look curved and a
plain homography is not enough. Model, in normalized image coordinates
u = (pixel - centre) / half-diagonal:

    undistorted = u * (1 + k1 r² + k2 r⁴),  r = |u|
    court (meters) = H · undistorted   (homogeneous)

k1, k2 and H are fitted by least squares on the clicked landmarks (both coordinates known)
and line marks (only y known). Errors are measured in meters on the court.
"""

from __future__ import annotations

import json
from collections.abc import Sequence
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from scipy.optimize import least_squares

from .court import COURT_LENGTH, COURT_WIDTH, LANDMARKS, LINE_MARKS, MIN_LANDMARKS

DEFAULT_MAX_ERROR_M = 0.15

LANDMARK_BY_KEY = {m.key: m for m in LANDMARKS}
LINE_MARK_BY_KEY = {m.key: m for m in LINE_MARKS}


class CalibrationError(ValueError):
    """The clicked points cannot give a trustworthy mapping."""


@dataclass(frozen=True)
class Lens:
    width: int
    height: int
    k1: float
    k2: float

    @property
    def centre(self) -> np.ndarray:
        return np.array([self.width / 2, self.height / 2])

    @property
    def scale(self) -> float:
        return float(np.hypot(self.width, self.height) / 2)

    def undistort(self, pixels: np.ndarray) -> np.ndarray:
        """Pixels (N×2) → undistorted normalized coordinates (N×2)."""
        u = (np.asarray(pixels, dtype=float) - self.centre) / self.scale
        r2 = np.sum(u * u, axis=1, keepdims=True)
        return u * (1 + self.k1 * r2 + self.k2 * r2 * r2)

    def distort(self, undistorted: np.ndarray, iterations: int = 30) -> np.ndarray:
        """Undistorted normalized coordinates (N×2) → pixels (N×2), by fixed-point iteration."""
        target = np.asarray(undistorted, dtype=float)
        u = target.copy()
        for _ in range(iterations):
            r2 = np.sum(u * u, axis=1, keepdims=True)
            u = target / (1 + self.k1 * r2 + self.k2 * r2 * r2)
        return u * self.scale + self.centre


def _apply_h(h: np.ndarray, points: np.ndarray) -> np.ndarray:
    homogeneous = np.column_stack([points, np.ones(len(points))]) @ h.T
    return homogeneous[:, :2] / homogeneous[:, 2:3]


def _dlt(src: np.ndarray, dst: np.ndarray) -> np.ndarray:
    """Homography src → dst from ≥ 4 correspondences (normalized DLT)."""

    def normalizer(p: np.ndarray) -> np.ndarray:
        mean = p.mean(axis=0)
        spread = np.sqrt(np.mean(np.sum((p - mean) ** 2, axis=1))) or 1.0
        s = np.sqrt(2) / spread
        return np.array([[s, 0, -s * mean[0]], [0, s, -s * mean[1]], [0, 0, 1]])

    ts, td = normalizer(src), normalizer(dst)
    a = _apply_h(ts, src)
    b = _apply_h(td, dst)
    rows = []
    for (x, y), (u, v) in zip(a, b, strict=True):
        rows.append([-x, -y, -1, 0, 0, 0, u * x, u * y, u])
        rows.append([0, 0, 0, -x, -y, -1, v * x, v * y, v])
    _, _, vt = np.linalg.svd(np.array(rows))
    hn = vt[-1].reshape(3, 3)
    h = np.linalg.inv(td) @ hn @ ts
    return h / h[2, 2]


@dataclass(frozen=True)
class Calibration:
    """A fitted mapping, plus what is needed to check and reuse it."""

    lens: Lens
    homography: np.ndarray
    rms_error_m: float
    max_error_m: float
    landmarks: dict[str, tuple[float, float]]
    line_marks: dict[str, tuple[float, float]]
    side_changes_s: tuple[float, ...] = field(default=())

    def to_court(self, pixels: np.ndarray, time_s: float = 0.0) -> np.ndarray:
        """Pixels (N×2) → court meters (N×2) in the analysed team's frame at `time_s`.

        After an odd number of side changes the analysed team plays on the other half, so
        the court is turned around: (x, y) → (9 - x, 18 - y).
        """
        court = _apply_h(self.homography, self.lens.undistort(pixels))
        if self.sides_swapped(time_s):
            court = np.array([COURT_WIDTH, COURT_LENGTH]) - court
        return court

    def to_pixels(self, court: np.ndarray, time_s: float = 0.0) -> np.ndarray:
        """Court meters (N×2) in the analysed team's frame → pixels (N×2)."""
        court = np.asarray(court, dtype=float)
        if self.sides_swapped(time_s):
            court = np.array([COURT_WIDTH, COURT_LENGTH]) - court
        return self.lens.distort(_apply_h(np.linalg.inv(self.homography), court))

    def sides_swapped(self, time_s: float) -> bool:
        return sum(1 for t in self.side_changes_s if t <= time_s) % 2 == 1

    def to_json(self) -> dict:
        return {
            "version": 1,
            "image": {"width": self.lens.width, "height": self.lens.height},
            "lens": {"k1": self.lens.k1, "k2": self.lens.k2},
            "homography": self.homography.tolist(),
            "rmsErrorM": self.rms_error_m,
            "maxErrorM": self.max_error_m,
            "landmarks": {k: list(v) for k, v in self.landmarks.items()},
            "lineMarks": {k: list(v) for k, v in self.line_marks.items()},
            "sideChangesS": list(self.side_changes_s),
        }

    @staticmethod
    def from_json(raw: dict) -> Calibration:
        return Calibration(
            lens=Lens(
                width=int(raw["image"]["width"]),
                height=int(raw["image"]["height"]),
                k1=float(raw["lens"]["k1"]),
                k2=float(raw["lens"]["k2"]),
            ),
            homography=np.array(raw["homography"], dtype=float),
            rms_error_m=float(raw["rmsErrorM"]),
            max_error_m=float(raw["maxErrorM"]),
            landmarks={k: (v[0], v[1]) for k, v in raw["landmarks"].items()},
            line_marks={k: (v[0], v[1]) for k, v in raw["lineMarks"].items()},
            side_changes_s=tuple(float(t) for t in raw.get("sideChangesS", [])),
        )

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_json(), indent=2) + "\n", encoding="utf-8")

    @staticmethod
    def load(path: Path) -> Calibration:
        return Calibration.from_json(json.loads(path.read_text(encoding="utf-8")))


def fit_calibration(
    width: int,
    height: int,
    landmarks: dict[str, tuple[float, float]],
    line_marks: dict[str, tuple[float, float]] | None = None,
    side_changes_s: Sequence[float] = (),
    max_error_m: float = DEFAULT_MAX_ERROR_M,
) -> Calibration:
    """Fits the lens and homography to clicked pixels.

    `landmarks` maps landmark keys (court.LANDMARKS) to pixels; `line_marks` maps line-mark
    keys (court.LINE_MARKS) to pixels. Raises CalibrationError with fewer than
    MIN_LANDMARKS landmarks, unknown keys, or an RMS error above `max_error_m`.
    """
    line_marks = line_marks or {}
    unknown = [k for k in landmarks if k not in LANDMARK_BY_KEY] + [
        k for k in line_marks if k not in LINE_MARK_BY_KEY
    ]
    if unknown:
        raise CalibrationError(f"Unknown points: {', '.join(unknown)}")
    if len(landmarks) < MIN_LANDMARKS:
        raise CalibrationError(
            f"At least {MIN_LANDMARKS} court points are needed, got {len(landmarks)}."
        )

    lm_keys = list(landmarks)
    lm_px = np.array([landmarks[k] for k in lm_keys], dtype=float)
    lm_court = np.array([[LANDMARK_BY_KEY[k].x, LANDMARK_BY_KEY[k].y] for k in lm_keys])
    line_keys = list(line_marks)
    line_px = np.array([line_marks[k] for k in line_keys], dtype=float).reshape(-1, 2)
    line_y = np.array([LINE_MARK_BY_KEY[k].y for k in line_keys])

    def unpack(params: np.ndarray) -> tuple[Lens, np.ndarray]:
        lens = Lens(width, height, float(params[0]), float(params[1]))
        h = np.append(params[2:], 1.0).reshape(3, 3)
        return lens, h

    def residuals(params: np.ndarray) -> np.ndarray:
        lens, h = unpack(params)
        lm = _apply_h(h, lens.undistort(lm_px)) - lm_court
        parts = [lm.ravel()]
        if len(line_px):
            parts.append(_apply_h(h, lens.undistort(line_px))[:, 1] - line_y)
        return np.concatenate(parts)

    start_lens = Lens(width, height, 0.0, 0.0)
    h0 = _dlt(start_lens.undistort(lm_px), lm_court)
    x0 = np.concatenate([[0.0, 0.0], h0.ravel()[:8]])
    result = least_squares(residuals, x0, method="lm", x_scale="jac", max_nfev=20000)
    lens, h = unpack(result.x)

    lm_err = np.linalg.norm(_apply_h(h, lens.undistort(lm_px)) - lm_court, axis=1)
    errors = lm_err
    if len(line_px):
        line_err = np.abs(_apply_h(h, lens.undistort(line_px))[:, 1] - line_y)
        errors = np.concatenate([lm_err, line_err])
    rms = float(np.sqrt(np.mean(errors**2)))
    worst = float(errors.max())
    if not np.isfinite(rms) or rms > max_error_m:
        raise CalibrationError(
            f"Calibration error {rms:.3f} m is above the limit of {max_error_m:.2f} m. "
            "Check that each point was clicked on the right court mark."
        )
    return Calibration(
        lens=lens,
        homography=h,
        rms_error_m=rms,
        max_error_m=worst,
        landmarks={k: (float(v[0]), float(v[1])) for k, v in landmarks.items()},
        line_marks={k: (float(v[0]), float(v[1])) for k, v in line_marks.items()},
        side_changes_s=tuple(sorted(float(t) for t in side_changes_s)),
    )
