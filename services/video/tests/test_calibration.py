import numpy as np
import pytest
from synthetic import HEIGHT, WIDTH, camera_pixels, clicks, court_grid

from volleyvideo.calibration import Calibration, CalibrationError, Lens, fit_calibration
from volleyvideo.court import LANDMARKS

LENSES = [(0.0, 0.0), (-0.12, 0.02), (-0.25, 0.05), (0.1, 0.0)]
GRID = court_grid(step=0.25, margin=0.0)
DEFAULT_LIMIT = 0.15


def grid_errors(calibration: Calibration, lens: Lens) -> np.ndarray:
    return np.linalg.norm(calibration.to_court(camera_pixels(GRID, lens)) - GRID, axis=1)


@pytest.mark.parametrize("k", LENSES)
def test_recovers_the_court_exactly_without_click_noise(k):
    lens = Lens(WIDTH, HEIGHT, *k)
    landmarks, lines = clicks(lens, noise_px=0.0)
    calibration = fit_calibration(WIDTH, HEIGHT, landmarks, lines)
    assert grid_errors(calibration, lens).max() < 0.05
    assert calibration.rms_error_m < 1e-3


@pytest.mark.parametrize("k", LENSES)
@pytest.mark.parametrize("seed", range(5))
def test_recovers_the_court_within_5_cm_rms_with_1_px_click_noise(k, seed):
    lens = Lens(WIDTH, HEIGHT, *k)
    landmarks, lines = clicks(lens, noise_px=1.0, seed=seed)
    calibration = fit_calibration(WIDTH, HEIGHT, landmarks, lines)
    errors = grid_errors(calibration, lens)
    assert np.sqrt(np.mean(errors**2)) < 0.05
    # The far corners are seen almost edge-on, so a 1 px click there is several cm.
    assert errors.max() < 0.2
    assert calibration.rms_error_m < DEFAULT_LIMIT


def test_works_with_landmarks_only():
    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, _ = clicks(lens, noise_px=0.5, with_lines=False)
    calibration = fit_calibration(WIDTH, HEIGHT, landmarks)
    assert np.sqrt(np.mean(grid_errors(calibration, lens) ** 2)) < 0.05


def test_needs_eight_landmarks():
    lens = Lens(WIDTH, HEIGHT, 0.0, 0.0)
    landmarks, lines = clicks(lens, noise_px=0.0)
    seven = dict(list(landmarks.items())[:7])
    with pytest.raises(CalibrationError, match="At least 8"):
        fit_calibration(WIDTH, HEIGHT, seven, lines)
    eight = dict(list(landmarks.items())[:8])
    fit_calibration(WIDTH, HEIGHT, eight, lines)


def test_rejects_unknown_points():
    lens = Lens(WIDTH, HEIGHT, 0.0, 0.0)
    landmarks, _ = clicks(lens, noise_px=0.0)
    with pytest.raises(CalibrationError, match="Unknown"):
        fit_calibration(WIDTH, HEIGHT, {**landmarks, "net-post": (1.0, 2.0)})


def test_rejects_a_point_clicked_on_the_wrong_mark():
    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, lines = clicks(lens, noise_px=0.5)
    swapped = dict(landmarks)
    swapped["our-attack-left"], swapped["their-attack-left"] = (
        landmarks["their-attack-left"],
        landmarks["our-attack-left"],
    )
    with pytest.raises(CalibrationError, match="above the limit"):
        fit_calibration(WIDTH, HEIGHT, swapped, lines)


def test_the_limit_is_configurable():
    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, lines = clicks(lens, noise_px=1.0)
    with pytest.raises(CalibrationError):
        fit_calibration(WIDTH, HEIGHT, landmarks, lines, max_error_m=0.001)


def test_side_changes_turn_the_court_around():
    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, lines = clicks(lens, noise_px=0.0)
    calibration = fit_calibration(WIDTH, HEIGHT, landmarks, lines, side_changes_s=[1800, 600])
    assert calibration.side_changes_s == (600.0, 1800.0)
    pixel = camera_pixels(np.array([[2.0, 5.0]]), lens)
    np.testing.assert_allclose(calibration.to_court(pixel, time_s=0), [[2.0, 5.0]], atol=1e-3)
    np.testing.assert_allclose(calibration.to_court(pixel, time_s=600), [[7.0, 13.0]], atol=1e-3)
    np.testing.assert_allclose(calibration.to_court(pixel, time_s=1000), [[7.0, 13.0]], atol=1e-3)
    np.testing.assert_allclose(calibration.to_court(pixel, time_s=1800), [[2.0, 5.0]], atol=1e-3)


@pytest.mark.parametrize("time_s", [0, 700])
def test_to_pixels_inverts_to_court(time_s):
    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, lines = clicks(lens, noise_px=0.0)
    calibration = fit_calibration(WIDTH, HEIGHT, landmarks, lines, side_changes_s=[600])
    court = np.array([[0.0, 0.0], [4.5, 9.0], [9.0, 18.0], [7.5, -1.0]])
    back = calibration.to_court(calibration.to_pixels(court, time_s), time_s)
    np.testing.assert_allclose(back, court, atol=1e-6)


def test_saves_and_loads(tmp_path):
    lens = Lens(WIDTH, HEIGHT, -0.12, 0.02)
    landmarks, lines = clicks(lens, noise_px=0.5)
    calibration = fit_calibration(WIDTH, HEIGHT, landmarks, lines, side_changes_s=[900])
    path = tmp_path / "match" / "calibration.json"
    calibration.save(path)
    loaded = Calibration.load(path)
    pixels = camera_pixels(GRID[::40], lens)
    np.testing.assert_allclose(loaded.to_court(pixels, 1000), calibration.to_court(pixels, 1000))
    assert loaded.landmarks == calibration.landmarks
    assert loaded.side_changes_s == (900.0,)


def test_every_landmark_is_on_the_court_outline_or_a_line():
    for m in LANDMARKS:
        assert m.x in (0.0, 9.0)
        assert m.y in (0.0, 6.0, 9.0, 12.0, 18.0)
