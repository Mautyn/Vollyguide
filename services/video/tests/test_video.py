import cv2
import numpy as np
import pytest

from volleyvideo.video import read_frame, video_info


def write_video(path, frames: int = 30, fps: float = 10.0, size=(64, 48)):
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"MJPG"), fps, size)
    assert writer.isOpened()
    for i in range(frames):
        writer.write(np.full((size[1], size[0], 3), i * 8, np.uint8))
    writer.release()
    return path


def test_info_and_frames(tmp_path):
    path = write_video(tmp_path / "clip.avi")
    info = video_info(path)
    assert (info.width, info.height) == (64, 48)
    assert info.fps == pytest.approx(10.0)
    assert info.duration_s == pytest.approx(3.0)
    # Frame i has brightness i * 8, so the time picks the right frame.
    assert read_frame(path, 1.0).mean() == pytest.approx(80, abs=3)
    assert read_frame(path, 99.0).mean() == pytest.approx(29 * 8, abs=3)


def test_missing_file(tmp_path):
    with pytest.raises(FileNotFoundError):
        video_info(tmp_path / "nope.mp4")
