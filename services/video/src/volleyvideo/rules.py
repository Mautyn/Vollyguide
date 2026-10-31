"""Overlap and libero rules at the moment of serve.

A port of src/domain/overlap.ts and src/domain/libero.ts. Both implementations run the
same cases from shared/rules/, so they cannot drift apart.
"""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass

Zone = int
ZONES: tuple[Zone, ...] = (1, 2, 3, 4, 5, 6)
FRONT_ROW: tuple[Zone, Zone, Zone] = (4, 3, 2)
"""Front row, left to right."""
BACK_ROW: tuple[Zone, Zone, Zone] = (5, 6, 1)
"""Back row, left to right."""
ZONE_BEHIND: Mapping[Zone, Zone] = {4: 5, 3: 6, 2: 1}
"""The back-row zone directly behind each front-row zone."""


def is_front_row(zone: Zone) -> bool:
    return zone in FRONT_ROW


@dataclass(frozen=True)
class Point:
    """A point on the court in meters."""

    x: float
    y: float


@dataclass(frozen=True)
class FrontBack:
    """The front-row player is not closer to the net than the player behind them."""

    front: Zone
    back: Zone
    kind: str = "front-back"


@dataclass(frozen=True)
class LeftRight:
    """Two players in the same row are not in left-to-right order."""

    left: Zone
    right: Zone
    kind: str = "left-right"


OverlapViolation = FrontBack | LeftRight


def find_overlap_violations(lineup: Mapping[Zone, Point]) -> list[OverlapViolation]:
    """Overlap faults for the team whose end line is y = 0, judged by feet position.

    Equal coordinates count as an overlap. Faults are listed in the same order as the
    TypeScript version: front-back pairs (4/5, 3/6, 2/1), then the front row, then the
    back row, left to right.
    """
    violations: list[OverlapViolation] = []
    for front in FRONT_ROW:
        back = ZONE_BEHIND[front]
        if not lineup[front].y > lineup[back].y:
            violations.append(FrontBack(front=front, back=back))
    for row in (FRONT_ROW, BACK_ROW):
        for left, right in zip(row, row[1:], strict=False):
            if not lineup[left].x < lineup[right].x:
                violations.append(LeftRight(left=left, right=right))
    return violations


def is_legal_lineup(lineup: Mapping[Zone, Point]) -> bool:
    return not find_overlap_violations(lineup)


def with_server_exempt(lineup: Mapping[Zone, Point], stand_in: Point) -> dict[Zone, Point]:
    """The lineup as the overlap rule sees it: the server (zone 1) is exempt, so a stand-in
    point (the zone-1 base spot) replaces wherever the server is standing."""
    return {**lineup, 1: stand_in}


@dataclass(frozen=True)
class LiberoInFrontRow:
    zone: Zone
    id: str
    kind: str = "front-row"


@dataclass(frozen=True)
class TooManyLiberos:
    count: int
    kind: str = "too-many"


LiberoViolation = LiberoInFrontRow | TooManyLiberos


def find_libero_violations(
    zones: Mapping[Zone, str], roles: Mapping[str, str]
) -> list[LiberoViolation]:
    """Libero rules at the moment of serve: never in the front row, at most one on court."""
    libero_zones = [zone for zone in ZONES if roles.get(zones[zone]) == "L"]
    violations: list[LiberoViolation] = [
        LiberoInFrontRow(zone=zone, id=zones[zone]) for zone in libero_zones if is_front_row(zone)
    ]
    if len(libero_zones) > 1:
        violations.append(TooManyLiberos(count=len(libero_zones)))
    return violations
