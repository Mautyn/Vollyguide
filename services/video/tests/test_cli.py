import argparse
import json

import pytest
from synthetic import HEIGHT, WIDTH, clicks
from test_video import write_video

from volleyvideo.calibration import Calibration, Lens
from volleyvideo.cli import format_time, main, parse_time


@pytest.mark.parametrize(
    ("text", "seconds"),
    [("90", 90), ("1:30", 90), ("1:02:03", 3723), ("0:00:01.5", 1.5)],
)
def test_parse_time(text, seconds):
    assert parse_time(text) == seconds


@pytest.mark.parametrize("text", ["", "a", "1::2", "1:2:3:4", "-5"])
def test_parse_time_rejects(text):
    with pytest.raises(argparse.ArgumentTypeError):
        parse_time(text)


def test_format_time():
    assert format_time(3723) == "1:02:03"


def test_calibrate_from_points_file(tmp_path, capsys):
    video = write_video(tmp_path / "match.avi", frames=3, size=(WIDTH, HEIGHT))
    landmarks, lines = clicks(Lens(WIDTH, HEIGHT, -0.12, 0.02), noise_px=0.5)
    points = tmp_path / "points.json"
    points.write_text(json.dumps({"landmarks": landmarks, "lineMarks": lines}))
    out = tmp_path / "out" / "calibration.json"
    code = main(
        ["calibrate", str(video), "--points", str(points), "--out", str(out)]
        + ["--side-change", "25:00", "--lang", "pl"]
    )
    assert code == 0
    calibration = Calibration.load(out)
    assert calibration.side_changes_s == (1500.0,)
    printed = capsys.readouterr().out
    assert "Błąd RMS" in printed and "0:25:00" in printed


def test_calibrate_reports_a_bad_fit(tmp_path, capsys):
    video = write_video(tmp_path / "match.avi", frames=3, size=(WIDTH, HEIGHT))
    landmarks, _ = clicks(Lens(WIDTH, HEIGHT, 0.0, 0.0), noise_px=0.0)
    points = tmp_path / "points.json"
    points.write_text(json.dumps({"landmarks": dict(list(landmarks.items())[:5])}))
    code = main(
        ["calibrate", str(video), "--points", str(points), "--out", str(tmp_path / "c.json")]
    )
    assert code == 2
    assert "At least 8" in capsys.readouterr().err
    assert not (tmp_path / "c.json").exists()
