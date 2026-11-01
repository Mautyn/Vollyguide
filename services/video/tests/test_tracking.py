import cv2
import numpy as np
from scaled import scaled_calibration

from volleyvideo.tracking import Box, sampled_frames, track_video


def write_numbered_video(path, frames=50, fps=25.0, size=(200, 120)):
    """Frame i is filled with brightness (i % 64) * 4, so tests can tell frames apart."""
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"MJPG"), fps, size)
    for i in range(frames):
        writer.write(np.full((size[1], size[0], 3), (i % 64) * 4, np.uint8))
    writer.release()
    return path


def frame_number(image) -> int:
    return int(round(image.mean() / 4))


def test_samples_frames_at_the_requested_rate(tmp_path):
    video = write_numbered_video(tmp_path / "v.avi")
    got = [(i, round(t, 2), frame_number(img)) for i, t, img in sampled_frames(video, fps=5)]
    assert [i for i, _, _ in got] == [0, 5, 10, 15, 20, 25, 30, 35, 40, 45]
    assert [n for _, _, n in got] == [i for i, _, _ in got]
    assert got[1][1] == 0.2


def test_samples_a_time_range(tmp_path):
    video = write_numbered_video(tmp_path / "v.avi")
    got = [i for i, _, _ in sampled_frames(video, fps=5, start_s=0.4, end_s=1.2)]
    assert got == [10, 15, 20, 25, 30]


def test_keeps_the_analysed_team_in_court_meters(tmp_path):
    video = write_numbered_video(tmp_path / "v.avi", frames=10)
    calibration = scaled_calibration(200, 120)

    def detector(image):
        # Feet at pixel (45, 45) → court (4.5, 4.5): ours. Pixel (45, 110) → (4.5, 11): theirs.
        return [Box(40, 20, 50, 45, 1, 0.9), Box(40, 80, 50, 110, 2, 0.8)]

    tracks = track_video(video, calibration, detector, fps=25)
    assert len(tracks) == 10
    assert set(tracks.track_id) == {1}
    np.testing.assert_allclose(tracks.x_m, 4.5)
    np.testing.assert_allclose(tracks.y_m, 4.5)
    np.testing.assert_allclose(tracks.y2, 45)


def test_follows_side_changes(tmp_path):
    video = write_numbered_video(tmp_path / "v.avi", frames=50)
    # From 1 s on the team plays on the other half: pixel (45, 135) → (4.5, 13.5) → (4.5, 4.5).
    calibration = scaled_calibration(200, 120, side_changes_s=[1.0])

    def detector(image):
        return [Box(40, 20, 50, 45, 1, 0.9), Box(40, 110, 50, 135, 2, 0.9)]

    tracks = track_video(video, calibration, detector, fps=5)
    before = tracks.select(tracks.time_s < 1.0)
    after = tracks.select(tracks.time_s >= 1.0)
    assert set(before.track_id) == {1}
    assert set(after.track_id) == {2}
    np.testing.assert_allclose(after.y_m, 4.5)


def test_reports_progress(tmp_path):
    video = write_numbered_video(tmp_path / "v.avi", frames=10)
    seen = []
    track_video(video, scaled_calibration(200, 120), lambda img: [], fps=25, progress=seen.append)
    assert len(seen) == 10 and seen == sorted(seen)
