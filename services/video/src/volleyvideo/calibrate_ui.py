"""The calibration window (OpenCV). Drawing helpers are pure so they can be tested; only
`run_calibration_window` needs a display.

Prompts are printed to the terminal, because OpenCV cannot draw Polish letters.
"""

from __future__ import annotations

from collections.abc import Callable

import cv2
import numpy as np

from .calibration import Calibration, CalibrationError, fit_calibration
from .click_session import ClickSession, Target
from .court import COURT_LINES, LANDMARKS, LINE_MARKS
from .i18n import t

WINDOW = "volleyvideo calibrate"
LOUPE_HALF = 40  # full-resolution pixels around the pending point
LOUPE_ZOOM = 5
GREEN = (80, 220, 80)
YELLOW = (0, 220, 255)
WHITE = (255, 255, 255)

_LANDMARK = {m.key: m for m in LANDMARKS}
_LINE = {m.key: m for m in LINE_MARKS}


def court_diagram(target_key: str | None, width: int = 150) -> np.ndarray:
    """A small top view of the court (our end line at the bottom) with the target marked."""
    scale = width / 13.0
    height = int(22 * scale)
    image = np.full((height, width, 3), 40, np.uint8)

    def px(x: float, y: float) -> tuple[int, int]:
        return int((x + 2) * scale), int((20 - y) * scale)

    for x0, y0, x1, y1 in COURT_LINES:
        cv2.line(image, px(x0, y0), px(x1, y1), WHITE, 1, cv2.LINE_AA)
    if target_key in _LANDMARK:
        m = _LANDMARK[target_key]
        cv2.circle(image, px(m.x, m.y), max(3, int(scale * 0.6)), YELLOW, -1, cv2.LINE_AA)
    elif target_key in _LINE:
        y = _LINE[target_key].y
        cv2.line(image, px(0, y), px(9, y), YELLOW, 3, cv2.LINE_AA)
    return image


def loupe(frame: np.ndarray, centre: tuple[float, float]) -> tuple[np.ndarray, tuple[int, int]]:
    """A zoomed crop around `centre` (full-res pixels) and the crop's top-left corner."""
    h, w = frame.shape[:2]
    cx = int(np.clip(round(centre[0]), LOUPE_HALF, w - LOUPE_HALF - 1))
    cy = int(np.clip(round(centre[1]), LOUPE_HALF, h - LOUPE_HALF - 1))
    x0, y0 = cx - LOUPE_HALF, cy - LOUPE_HALF
    crop = frame[y0 : y0 + 2 * LOUPE_HALF, x0 : x0 + 2 * LOUPE_HALF]
    zoomed = cv2.resize(crop, None, fx=LOUPE_ZOOM, fy=LOUPE_ZOOM, interpolation=cv2.INTER_NEAREST)
    return zoomed, (x0, y0)


def court_polylines(calibration: Calibration, samples: int = 60) -> list[np.ndarray]:
    """Each court line as pixels, following the fitted lens distortion."""
    lines = []
    for x0, y0, x1, y1 in COURT_LINES:
        s = np.linspace(0, 1, samples)[:, None]
        court = np.array([x0, y0]) + s * np.array([x1 - x0, y1 - y0])
        lines.append(calibration.to_pixels(court))
    return lines


class _Window:
    def __init__(self, frame: np.ndarray, max_width: int, max_height: int) -> None:
        self.frame = frame
        h, w = frame.shape[:2]
        self.scale = min(1.0, max_width / w, max_height / h)
        self.base = cv2.resize(frame, None, fx=self.scale, fy=self.scale)
        self.pending: tuple[float, float] | None = None
        self.loupe_origin: tuple[int, int] | None = None
        self.loupe_box: tuple[int, int, int, int] | None = None

    def to_full(self, x: int, y: int) -> tuple[float, float]:
        return x / self.scale, y / self.scale

    def to_display(self, p: tuple[float, float]) -> tuple[int, int]:
        return int(p[0] * self.scale), int(p[1] * self.scale)

    def on_mouse(self, event: int, x: int, y: int) -> None:
        if event != cv2.EVENT_LBUTTONDOWN:
            return
        box = self.loupe_box
        if box and self.loupe_origin and box[0] <= x < box[2] and box[1] <= y < box[3]:
            # Inside the magnifier: refine to a quarter-pixel on the full frame.
            ox, oy = self.loupe_origin
            self.pending = (ox + (x - box[0]) / LOUPE_ZOOM, oy + (y - box[1]) / LOUPE_ZOOM)
        else:
            self.pending = self.to_full(x, y)

    def render(self, session: ClickSession, calibration: Calibration | None = None) -> np.ndarray:
        image = self.base.copy()
        for point in session.points.values():
            cv2.circle(image, self.to_display(point), 4, GREEN, -1, cv2.LINE_AA)
        if calibration is not None:
            for line in court_polylines(calibration):
                pts = (line * self.scale).astype(np.int32).reshape(-1, 1, 2)
                cv2.polylines(image, [pts], False, YELLOW, 1, cv2.LINE_AA)
        current = session.current
        if current is not None:
            diagram = court_diagram(current.key)
            dh, dw = diagram.shape[:2]
            image[10 : 10 + dh, 10 : 10 + dw] = diagram
            cv2.putText(
                image,
                f"{session.index + 1}/{session.index + _remaining(session)}",
                (12, 30 + dh),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                WHITE,
                2,
            )
        self.loupe_box = None
        if self.pending is not None and calibration is None:
            cv2.drawMarker(image, self.to_display(self.pending), YELLOW, cv2.MARKER_CROSS, 16)
            zoomed, self.loupe_origin = loupe(self.frame, self.pending)
            px = (self.pending[0] - self.loupe_origin[0]) * LOUPE_ZOOM
            py = (self.pending[1] - self.loupe_origin[1]) * LOUPE_ZOOM
            cv2.drawMarker(zoomed, (int(px), int(py)), YELLOW, cv2.MARKER_CROSS, 24)
            zh, zw = zoomed.shape[:2]
            ih, iw = image.shape[:2]
            if zh < ih and zw < iw:
                x0 = iw - zw - 10
                image[10 : 10 + zh, x0 : x0 + zw] = zoomed
                self.loupe_box = (x0, 10, x0 + zw, 10 + zh)
        return image


def _remaining(session: ClickSession) -> int:
    from .click_session import TARGETS

    return len(TARGETS) - session.index


def _prompt(target: Target, step: int, total: int, lang: str) -> str:
    optional = t(lang, "optional") if target.optional else ""
    return t(lang, "prompt", name=t(lang, target.key), step=step, total=total, optional=optional)


def run_calibration_window(
    frame: np.ndarray,
    fit: Callable[[ClickSession], Calibration],
    lang: str = "en",
    max_width: int = 1600,
    max_height: int = 900,
) -> Calibration | None:
    """Interactive calibration. Returns the accepted calibration, or None if cancelled."""
    from .click_session import TARGETS

    window = _Window(frame, max_width, max_height)
    session = ClickSession()
    cv2.namedWindow(WINDOW, cv2.WINDOW_AUTOSIZE)
    cv2.setMouseCallback(WINDOW, lambda e, x, y, *_: window.on_mouse(e, x, y))
    print(t(lang, "orientation"))
    print(t(lang, "keys"))
    shown = -1
    try:
        while True:
            if session.current is not None and session.index != shown:
                print(_prompt(session.current, session.index + 1, len(TARGETS), lang))
                shown = session.index
            cv2.imshow(WINDOW, window.render(session))
            key = cv2.waitKey(30) & 0xFF
            if key == 27:  # Esc
                return None
            if key == ord(" ") and window.pending is not None:
                session.click(*window.pending)
                window.pending = None
            elif key in (ord("s"), ord("S")):
                window.pending = None
                session.skip()
            elif key in (ord("u"), ord("U")):
                if window.pending is not None:
                    window.pending = None
                else:
                    session.undo()
            elif key in (ord("f"), ord("F")) or session.finished:
                if not session.enough:
                    print(t(lang, "need-more", count=8))
                    if session.finished:
                        session.undo()
                    continue
                try:
                    calibration = fit(session)
                except CalibrationError as error:
                    print(t(lang, "failed", reason=error))
                    session = ClickSession()
                    shown = -1
                    continue
                print(t(lang, "review", rms=calibration.rms_error_m, worst=calibration.max_error_m))
                while True:
                    cv2.imshow(WINDOW, window.render(session, calibration))
                    key = cv2.waitKey(30) & 0xFF
                    if key == ord(" "):
                        return calibration
                    if key == 27:
                        return None
                    if key in (ord("r"), ord("R")):
                        session = ClickSession()
                        shown = -1
                        break
    finally:
        cv2.destroyWindow(WINDOW)


def fit_from_session(
    width: int, height: int, side_changes_s: list[float], max_error_m: float
) -> Callable[[ClickSession], Calibration]:
    def fit(session: ClickSession) -> Calibration:
        return fit_calibration(
            width,
            height,
            session.landmarks,
            session.line_marks,
            side_changes_s=side_changes_s,
            max_error_m=max_error_m,
        )

    return fit
