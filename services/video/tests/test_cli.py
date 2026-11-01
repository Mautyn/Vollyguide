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


def test_track_rallies_and_check_end_to_end(tmp_path, monkeypatch, capsys):
    """The commands chained on a tiny generated video, with a fake detector."""
    import numpy as np
    from scaled import scaled_calibration
    from test_tracking import write_numbered_video

    import volleyvideo.cli as cli
    from volleyvideo.tracking import Box

    video = write_numbered_video(tmp_path / "match.avi", frames=250, fps=25.0)
    calibration_path = tmp_path / "calibration.json"
    scaled_calibration(200, 120).save(calibration_path)

    def fake_detector(_args):
        state = {"n": 0}

        def detect(_image):
            # Two players: still for 3 s, running 3–8 s, still again.
            n = state["n"]
            state["n"] += 1
            t = n / 10
            dx = 25 * min(max(t - 3, 0), 5)  # 2.5 m/s while running
            wobble = 10 * np.sin(n) if 3 <= t < 8 else 0
            return [
                Box(10 + dx, 10, 20 + dx, 30 + wobble, 1, 0.9),
                Box(100 - dx, 40, 110 - dx, 60 - wobble, 2, 0.9),
            ]

        detect.device = "cpu"
        return detect

    monkeypatch.setattr(cli, "make_detector", fake_detector)
    tracks_path = tmp_path / "tracks.npz"
    assert cli.main(["track", str(video), "--calibration", str(calibration_path),
                     "--out", str(tracks_path)]) == 0  # fmt: skip
    out = capsys.readouterr().out
    assert "on cpu" in out and "Saved tracks" in out

    rallies_path = tmp_path / "rallies.json"
    assert cli.main(["rallies", str(video), "--tracks", str(tracks_path),
                     "--out", str(rallies_path), "--lang", "pl"]) == 0  # fmt: skip
    out = capsys.readouterr().out
    assert "nie ma czytelnego dźwięku" in out  # the generated video has no sound
    assert "Znaleziono 1 akcji" in out

    truth = tmp_path / "truth.txt"
    truth.write_text("# serves I noted\n0:00:03\n\n0:00:40  # not in this clip\n")
    assert cli.main(["rallies-check", str(truth), "--rallies", str(rallies_path)]) == 0
    out = capsys.readouterr().out
    assert "Found 1 of 2" in out and "0:00:40" in out


def test_track_needs_a_calibration(tmp_path, capsys):
    from test_tracking import write_numbered_video

    video = write_numbered_video(tmp_path / "match.avi", frames=5)
    assert main(["track", str(video), "--calibration", str(tmp_path / "none.json")]) == 2
    assert "volleyvideo calibrate" in capsys.readouterr().err


def test_rallies_needs_tracks(tmp_path, capsys):
    from test_tracking import write_numbered_video

    video = write_numbered_video(tmp_path / "match.avi", frames=5)
    assert main(["rallies", str(video), "--tracks", str(tmp_path / "none.npz")]) == 2
    assert "volleyvideo track" in capsys.readouterr().err
