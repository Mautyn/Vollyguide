import numpy as np
import pytest

from volleyvideo.audio import Whistle
from volleyvideo.rallies import (
    Rally,
    activity,
    evaluate,
    find_rallies,
    load_rallies,
    movement_segments,
    save_rallies,
)
from volleyvideo.tracks import Tracks

FPS = 10
RALLIES = [(20.0, 30.0), (50.0, 58.0), (90.0, 105.0)]


def match(burst=(70.0, 71.5), server_behind_line_before=None, seed=0):
    """120 s of six players: slow drifting between rallies, fast running during them, plus
    one short burst of movement that is not a rally."""
    rng = np.random.default_rng(seed)
    times = np.arange(0, 120, 1 / FPS)
    rows = []
    for player in range(6):
        x, y = 1.5 + 3 * (player % 3), 2.0 + 4 * (player // 3)
        heading = rng.uniform(0, 2 * np.pi)
        for i, t in enumerate(times):
            fast = any(a <= t < b for a, b in RALLIES) or burst[0] <= t < burst[1]
            speed = 2.6 if fast else 0.3
            heading += rng.normal(0, 0.4)
            x, y = x + np.cos(heading) * speed / FPS, y + np.sin(heading) * speed / FPS
            # Bounce off the edges of the half, so the speed stays what it should be.
            if not 0.3 <= x <= 8.7:
                x, heading = float(np.clip(2 * np.clip(x, 0.3, 8.7) - x, 0.3, 8.7)), np.pi - heading
            if not 0.3 <= y <= 8.7:
                y, heading = float(np.clip(2 * np.clip(y, 0.3, 8.7) - y, 0.3, 8.7)), -heading
            px, py = x, y
            if server_behind_line_before is not None and player == 0:
                serve = server_behind_line_before
                if serve - 4 <= t < serve:
                    px, py = 7.5, -1.0
            rows.append((t, i, player, px, py, 0.9, 0, 0, 0, 0))
    return Tracks.from_rows(rows)


def test_activity_is_the_typical_player_speed():
    times, speed = activity(match())
    assert speed[(times > 22) & (times < 28)].mean() == pytest.approx(2.6, rel=0.15)
    assert speed[(times > 35) & (times < 45)].mean() < 0.5


def test_finds_the_rallies_and_ignores_a_short_burst():
    times, speed = activity(match())
    segments = movement_segments(times, speed)
    assert len(segments) == 3
    for (start, end), (a, b) in zip(segments, RALLIES, strict=True):
        assert start == pytest.approx(a, abs=1.0)
        assert end == pytest.approx(b, abs=1.0)


def test_merges_a_short_pause_inside_a_rally():
    times = np.arange(0, 20, 0.1)
    speed = np.where((times >= 5) & (times < 15), 2.0, 0.2)
    speed[(times >= 9) & (times < 10)] = 0.3  # a one-second pause
    assert movement_segments(times, speed) == [(pytest.approx(5.0), pytest.approx(14.9))]


def test_uses_whistles_for_start_and_end_and_suggests_the_serve():
    whistles = [Whistle(14.0, 14.5), Whistle(31.0, 31.6), Whistle(44.0, 44.4),
                Whistle(59.5, 60.0)]  # fmt: skip
    found = find_rallies(match(), whistles)
    assert [r.index for r in found] == [1, 2, 3]
    first, second, third = found
    assert first.start_whistle_s == 14.0 and first.end_whistle_s == 31.0
    assert first.start_s == 14.0 and first.end_s == 31.0
    assert first.serve_s == pytest.approx(20.0, abs=1.0)
    assert second.start_whistle_s == 44.0 and second.end_whistle_s == 59.5
    assert third.start_whistle_s is None and third.end_whistle_s is None
    assert third.serve_s == pytest.approx(90.0, abs=1.0)
    assert third.end_s == pytest.approx(105.0, abs=1.0)


def test_marks_our_serve_when_someone_stands_behind_our_end_line():
    found = find_rallies(match(server_behind_line_before=50.0))
    assert [r.our_serve for r in found] == [False, True, False]


def test_no_tracks_no_rallies():
    assert find_rallies(Tracks.empty()) == []


def test_save_and_load(tmp_path):
    rallies = find_rallies(match())
    path = tmp_path / "rallies.json"
    save_rallies(path, rallies, {"video": "m.mp4"})
    assert load_rallies(path) == rallies


def rally(serve):
    return Rally(1, serve - 2, serve, serve + 8, False, None, None)


def test_evaluate_against_hand_noted_serves():
    result = evaluate([rally(20.5), rally(50), rally(75), rally(91)], [20, 49, 90.5, 130])
    assert (result.found, result.truth, result.detected) == (3, 4, 4)
    assert result.recall == 0.75 and result.precision == 0.75
    assert result.missed == [130] and result.extra == [75]
    # Each detected serve counts once.
    assert evaluate([rally(10)], [9.5, 10.5]).found == 1
