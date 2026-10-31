"""Runs the rule cases shared with the site (shared/rules/), like src/domain/sharedRules.test.ts."""

import json
from dataclasses import asdict
from pathlib import Path

import pytest

from volleyvideo.rules import (
    FrontBack,
    Point,
    find_libero_violations,
    find_overlap_violations,
    is_legal_lineup,
    with_server_exempt,
)

RULES = Path(__file__).resolve().parents[3] / "shared" / "rules"


def load(name: str) -> list[dict]:
    return json.loads((RULES / name).read_text(encoding="utf-8"))["cases"]


def as_json(violation) -> dict:
    """The violation as the TypeScript version returns it (kind first, same keys)."""
    return asdict(violation)


OVERLAP_CASES = load("overlap-cases.json")
LIBERO_CASES = load("libero-cases.json")


@pytest.mark.parametrize("case", OVERLAP_CASES, ids=[c["name"] for c in OVERLAP_CASES])
def test_shared_overlap_case(case):
    lineup = {int(zone): Point(**p) for zone, p in case["lineup"].items()}
    assert [as_json(v) for v in find_overlap_violations(lineup)] == case["violations"]


@pytest.mark.parametrize("case", LIBERO_CASES, ids=[c["name"] for c in LIBERO_CASES])
def test_shared_libero_case(case):
    zones = {int(zone): pid for zone, pid in case["zones"].items()}
    assert [as_json(v) for v in find_libero_violations(zones, case["roles"])] == case["violations"]


def test_shared_cases_exist():
    assert len(OVERLAP_CASES) >= 10
    assert len(LIBERO_CASES) >= 5


def test_server_is_exempt():
    base = {
        4: Point(1.5, 7.5),
        3: Point(4.5, 7.5),
        2: Point(7.5, 7.5),
        5: Point(1.5, 3),
        6: Point(4.5, 3),
        1: Point(7.5, 3),
    }
    server_on_the_left = {**base, 1: Point(1, -1)}
    assert not is_legal_lineup(server_on_the_left)
    assert is_legal_lineup(with_server_exempt(server_on_the_left, base[1]))
    # Everyone else is still checked.
    assert find_overlap_violations(with_server_exempt({**base, 3: Point(4.5, 2)}, base[1])) == [
        FrontBack(front=3, back=6)
    ]
