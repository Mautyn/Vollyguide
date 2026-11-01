"""A calibration where court meters are simply pixels / 10 (no lens distortion)."""

import numpy as np

from volleyvideo.calibration import Calibration, Lens


def scaled_calibration(width: int, height: int, side_changes_s=()) -> Calibration:
    lens = Lens(width, height, 0.0, 0.0)
    s, (cx, cy) = lens.scale, lens.centre
    h = np.array([[s / 10, 0, cx / 10], [0, s / 10, cy / 10], [0, 0, 1.0]])
    return Calibration(lens, h, 0.0, 0.0, {}, {}, tuple(side_changes_s))
