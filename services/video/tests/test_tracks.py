import numpy as np
import pytest

from volleyvideo.tracks import CourtArea, Tracks


@pytest.mark.parametrize(
    ("x", "y", "kept"),
    [
        (4.5, 4.5, True),  # on our half
        (7.5, -1.0, True),  # serving behind the end line
        (4.5, 9.2, True),  # at the net
        (-1.0, 3.0, True),  # libero replacement zone
        (4.5, 11.0, False),  # the other team
        (-3.0, 4.0, False),  # bench
        (4.5, -6.0, False),  # far behind the end line
        (-0.5, 9.0, False),  # first referee at the left post
        (9.6, 9.2, False),  # second referee at the right post
        (0.5, 8.6, True),  # our left-front player near the post, inside the court
    ],
)
def test_court_area(x, y, kept):
    assert CourtArea().contains(np.array([x]), np.array([y]))[0] == kept


def test_save_and_load(tmp_path):
    rows = [(0.1 * i, i, i % 3, 1.0 + i, 2.0, 0.9, 10, 20, 30, 40) for i in range(6)]
    tracks = Tracks.from_rows(rows)
    path = tmp_path / "out" / "tracks.npz"
    tracks.save(path, {"fps": 10})
    loaded, meta = Tracks.load(path)
    assert meta == {"fps": 10}
    np.testing.assert_allclose(loaded.x_m, tracks.x_m)
    np.testing.assert_array_equal(loaded.track_id, [0, 1, 2, 0, 1, 2])
    assert len(Tracks.from_rows([])) == 0
    np.testing.assert_allclose(loaded.select(loaded.track_id == 1).time_s, [0.1, 0.4], atol=1e-6)
