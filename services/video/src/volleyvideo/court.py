"""Court landmarks the user clicks during calibration, in the site's coordinates.

Calibration uses the analysed team's side as it is in the calibration frame: their end
line at y = 0, the net at y = 9, x = 0..9 from their left sideline (as seen from behind
their own end line).
"""

from __future__ import annotations

from dataclasses import dataclass

COURT_WIDTH = 9.0
COURT_LENGTH = 18.0
NET_Y = 9.0


@dataclass(frozen=True)
class Landmark:
    """A line intersection with a known position."""

    key: str
    x: float
    y: float


@dataclass(frozen=True)
class LineMark:
    """Any point on a line across the court: only its y is known."""

    key: str
    y: float


# Clicked in this order. All ten are on the sidelines, so the line marks below add points
# across the middle of the court, which pins down the lens distortion there.
LANDMARKS: tuple[Landmark, ...] = (
    Landmark("our-end-left", 0.0, 0.0),
    Landmark("our-end-right", 9.0, 0.0),
    Landmark("our-attack-left", 0.0, 6.0),
    Landmark("our-attack-right", 9.0, 6.0),
    Landmark("centre-left", 0.0, 9.0),
    Landmark("centre-right", 9.0, 9.0),
    Landmark("their-attack-left", 0.0, 12.0),
    Landmark("their-attack-right", 9.0, 12.0),
    Landmark("their-end-left", 0.0, 18.0),
    Landmark("their-end-right", 9.0, 18.0),
)

LINE_MARKS: tuple[LineMark, ...] = (
    LineMark("our-end-line", 0.0),
    LineMark("our-attack-line", 6.0),
    LineMark("centre-line-a", 9.0),
    LineMark("centre-line-b", 9.0),
    LineMark("their-attack-line", 12.0),
    LineMark("their-end-line", 18.0),
)

MIN_LANDMARKS = 8

# Court lines for drawing the fitted court back onto the frame: (x0, y0, x1, y1).
COURT_LINES: tuple[tuple[float, float, float, float], ...] = (
    (0, 0, 9, 0),
    (0, 18, 9, 18),
    (0, 0, 0, 18),
    (9, 0, 9, 18),
    (0, 6, 9, 6),
    (0, 9, 9, 9),
    (0, 12, 9, 12),
)
