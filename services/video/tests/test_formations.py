import pytest

from volleyvideo.formations import PHASES, SYSTEMS, load_formations
from volleyvideo.rules import find_libero_violations, is_legal_lineup, with_server_exempt

DATA = load_formations()
ROTATIONS = range(1, 7)


def test_loads_every_system_rotation_and_phase():
    assert len(DATA.formations) == len(SYSTEMS) * 6 * len(PHASES)
    for system in SYSTEMS:
        for rotation in ROTATIONS:
            for phase in PHASES:
                formation = DATA.find(system, rotation, phase)
                assert formation.id == f"{system}-r{rotation}-{phase}"
                assert sorted(formation.zones()) == [1, 2, 3, 4, 5, 6]


def test_constants():
    c = DATA.constants
    assert c.server_spot.y < 0
    assert sorted(c.base_spots) == sorted(c.defense_spots) == [1, 2, 3, 4, 5, 6]
    assert c.libero_id == "l"
    assert c.libero_serves_for == "mb1"


def test_unknown_formation():
    with pytest.raises(KeyError):
        DATA.find("3-3", 1, "base")


@pytest.mark.parametrize("formation", DATA.formations, ids=[f.id for f in DATA.formations])
def test_every_formation_is_legal(formation):
    lineup = formation.lineup()
    if formation.phase == "serve":
        lineup = with_server_exempt(lineup, DATA.constants.base_spots[1])
    assert is_legal_lineup(lineup)
    roles = {p.id: p.role for p in formation.players}
    assert find_libero_violations(formation.zones(), roles) == []


def test_4_2_receive_rotation_1_matches_the_site():
    """A spot check that the export carries the hand-written 4-2 positions."""
    s2 = next(p for p in DATA.find("4-2", 1, "receive").players if p.id == "s2")
    assert (s2.zone, s2.position.x, s2.position.y) == (4, 3.6, 8.6)
