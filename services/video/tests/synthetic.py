"""A synthetic camera for tests: a pinhole camera beside the court plus lens distortion."""

from __future__ import annotations

import numpy as np

from volleyvideo.calibration import Lens
from volleyvideo.court import LANDMARKS, LINE_MARKS

WIDTH, HEIGHT = 3840, 1200


def camera_pixels(court: np.ndarray, lens: Lens) -> np.ndarray:
    """Court points (N×2, meters) → distorted pixels, seen from a camera 6 m beside the
    left sideline at mid-court, 4 m high, looking at the centre of the court."""
    eye = np.array([-6.0, 9.0, 4.0])
    target = np.array([4.5, 9.0, 0.0])
    forward = (target - eye) / np.linalg.norm(target - eye)
    right = np.cross(forward, [0.0, 0.0, 1.0])
    right /= np.linalg.norm(right)
    down = np.cross(forward, right)
    points = np.column_stack([court, np.zeros(len(court))]) - eye
    cam = np.column_stack([points @ right, points @ down, points @ forward])
    focal = 1100.0
    pinhole = focal * cam[:, :2] / cam[:, 2:3] + np.array([WIDTH / 2, HEIGHT / 2])
    normalized = (pinhole - lens.centre) / lens.scale
    return lens.distort(normalized)


def clicks(
    lens: Lens, noise_px: float, seed: int = 1, with_lines: bool = True
) -> tuple[dict[str, tuple[float, float]], dict[str, tuple[float, float]]]:
    """Landmark and line-mark clicks with Gaussian click noise."""
    rng = np.random.default_rng(seed)
    lm_court = np.array([[m.x, m.y] for m in LANDMARKS])
    lm_px = camera_pixels(lm_court, lens) + rng.normal(0, noise_px, (len(LANDMARKS), 2))
    landmarks = {m.key: (float(p[0]), float(p[1])) for m, p in zip(LANDMARKS, lm_px, strict=True)}
    if not with_lines:
        return landmarks, {}
    # Line marks somewhere across the middle of each line.
    xs = rng.uniform(2.5, 6.5, len(LINE_MARKS))
    line_court = np.array([[x, m.y] for x, m in zip(xs, LINE_MARKS, strict=True)])
    line_px = camera_pixels(line_court, lens) + rng.normal(0, noise_px, (len(LINE_MARKS), 2))
    line_marks = {
        m.key: (float(p[0]), float(p[1])) for m, p in zip(LINE_MARKS, line_px, strict=True)
    }
    return landmarks, line_marks


def court_grid(step: float = 0.5, margin: float = 1.0) -> np.ndarray:
    """Points over the court and a margin around it."""
    xs = np.arange(-margin, 9 + margin + 1e-9, step)
    ys = np.arange(-margin, 18 + margin + 1e-9, step)
    return np.array([[x, y] for x in xs for y in ys])
