"""Drawing helpers of the calibration window; none of these need a display."""

import cv2
import numpy as np
from synthetic import HEIGHT, WIDTH, camera_pixels, clicks

from volleyvideo.calibrate_ui import (
    LOUPE_HALF,
    LOUPE_ZOOM,
    _Window,
    court_diagram,
    court_polylines,
    loupe,
)
from volleyvideo.calibration import Lens, fit_calibration
from volleyvideo.click_session import ClickSession


def test_court_diagram_marks_the_target():
    plain = court_diagram(None)
    corner = court_diagram("our-end-left")
    line = court_diagram("centre-line-a")
    assert plain.shape == corner.shape == line.shape
    assert not np.array_equal(plain, corner)
    assert not np.array_equal(plain, line)


def test_loupe_stays_inside_the_frame():
    frame = np.zeros((200, 300, 3), np.uint8)
    zoomed, origin = loupe(frame, (0, 0))
    assert origin == (0, 0)
    assert zoomed.shape[:2] == (2 * LOUPE_HALF * LOUPE_ZOOM, 2 * LOUPE_HALF * LOUPE_ZOOM)
    _, origin = loupe(frame, (299, 199))
    assert origin == (300 - 2 * LOUPE_HALF - 1, 200 - 2 * LOUPE_HALF - 1)


def test_court_lines_follow_the_fitted_distortion():
    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, lines = clicks(lens, noise_px=0.0)
    calibration = fit_calibration(WIDTH, HEIGHT, landmarks, lines)
    centre_line = court_polylines(calibration, samples=11)[5]
    expected = camera_pixels(np.column_stack([np.linspace(0, 9, 11), np.full(11, 9.0)]), lens)
    np.testing.assert_allclose(centre_line, expected, atol=0.5)


def test_click_then_refine_in_the_magnifier():
    frame = np.zeros((1200, 3840, 3), np.uint8)
    window = _Window(frame, max_width=1600, max_height=900)
    window.on_mouse(cv2.EVENT_LBUTTONDOWN, 800, 250)
    first = window.pending
    assert first == (800 / window.scale, 250 / window.scale)
    image = window.render(ClickSession())
    assert window.loupe_box is not None
    assert image.shape[1] == round(3840 * window.scale)
    # Clicking one zoomed pixel right of the loupe's left edge lands a fraction of a pixel in.
    x0, y0, _, _ = window.loupe_box
    window.on_mouse(cv2.EVENT_LBUTTONDOWN, x0 + 1, y0 + 2)
    ox, oy = window.loupe_origin
    assert window.pending == (ox + 1 / LOUPE_ZOOM, oy + 2 / LOUPE_ZOOM)


class FakeGui:
    """Stands in for OpenCV's window functions and replays a script of clicks and keys."""

    def __init__(self, script):
        self.script = list(script)
        self.callback = None
        self.shown = 0
        self.idle = 0

    def install(self, monkeypatch):
        import volleyvideo.calibrate_ui as ui

        monkeypatch.setattr(ui.cv2, "namedWindow", lambda *a, **k: None)
        monkeypatch.setattr(ui.cv2, "destroyWindow", lambda *a, **k: None)
        monkeypatch.setattr(
            ui.cv2, "setMouseCallback", lambda _w, cb: setattr(self, "callback", cb)
        )
        monkeypatch.setattr(ui.cv2, "imshow", lambda *a: setattr(self, "shown", self.shown + 1))
        monkeypatch.setattr(ui.cv2, "waitKey", self.wait_key)

    def wait_key(self, _delay):
        while self.script:
            step = self.script.pop(0)
            if step[0] == "click":
                self.callback(cv2.EVENT_LBUTTONDOWN, step[1], step[2], 0, None)
                continue
            return ord(step[1]) if isinstance(step[1], str) else step[1]
        # No key pressed within the delay, like the real waitKey; a stuck loop still fails.
        self.idle += 1
        if self.idle > 5:
            raise AssertionError("script ran out")
        return 255


def full_run_script(window_scale, landmarks, lines, extra=()):
    """Click every landmark and line mark at display resolution, confirming each with Space."""
    from volleyvideo.click_session import TARGETS

    points = {**landmarks, **lines}
    script = list(extra)
    for target in TARGETS:
        x, y = points[target.key]
        script += [("click", int(x * window_scale), int(y * window_scale)), ("key", " ")]
    return script


def test_window_loop_runs_a_whole_calibration(monkeypatch, capsys):
    from volleyvideo.calibrate_ui import fit_from_session, run_calibration_window

    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, lines = clicks(lens, noise_px=0.0)
    frame = np.zeros((HEIGHT, WIDTH, 3), np.uint8)
    scale = _Window(frame, 1600, 900).scale
    # Start with a wrong click that is undone, and a skip that is undone.
    extra = [("click", 5, 5), ("key", " "), ("key", "u"), ("key", "s"), ("key", "u")]
    gui = FakeGui(full_run_script(scale, landmarks, lines, extra) + [("key", 255), ("key", " ")])
    gui.install(monkeypatch)
    calibration = run_calibration_window(frame, fit_from_session(WIDTH, HEIGHT, [600], 0.15))
    assert calibration is not None
    assert set(calibration.landmarks) == set(landmarks)
    assert calibration.side_changes_s == (600.0,)
    # Display-resolution clicks are about 2.4 px apart, still well inside the limit.
    assert calibration.rms_error_m < 0.15
    out = capsys.readouterr().out
    assert "Our end line, left corner" in out and "RMS error" in out


def test_window_loop_can_be_cancelled(monkeypatch, capsys):
    from volleyvideo.calibrate_ui import fit_from_session, run_calibration_window

    gui = FakeGui([("click", 10, 10), ("key", 27)])
    gui.install(monkeypatch)
    frame = np.zeros((HEIGHT, WIDTH, 3), np.uint8)
    assert (
        run_calibration_window(frame, fit_from_session(WIDTH, HEIGHT, [], 0.15), lang="pl") is None
    )
    assert "Nasza linia końcowa" in capsys.readouterr().out


def test_window_loop_waits_for_eight_landmarks(monkeypatch, capsys):
    from volleyvideo.calibrate_ui import fit_from_session, run_calibration_window

    gui = FakeGui([("key", "s"), ("key", "f"), ("key", 27)])
    gui.install(monkeypatch)
    frame = np.zeros((HEIGHT, WIDTH, 3), np.uint8)
    assert run_calibration_window(frame, fit_from_session(WIDTH, HEIGHT, [], 0.15)) is None
    assert "At least 8" in capsys.readouterr().out
