"""The site's formations, exported by `npm run export:formations` to data/formations.json."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .rules import Point, Zone

DEFAULT_PATH = Path(__file__).resolve().parents[2] / "data" / "formations.json"

SYSTEMS = ("5-1", "6-2", "4-2")
PHASES = ("base", "serve", "receive")


@dataclass(frozen=True)
class FormationPlayer:
    id: str
    role: str
    label: str
    zone: Zone
    position: Point


@dataclass(frozen=True)
class Formation:
    id: str
    system: str
    rotation: int
    phase: str
    players: tuple[FormationPlayer, ...]

    def lineup(self) -> dict[Zone, Point]:
        """Feet position per zone."""
        return {p.zone: p.position for p in self.players}

    def zones(self) -> dict[Zone, str]:
        """Player id per zone."""
        return {p.zone: p.id for p in self.players}


@dataclass(frozen=True)
class Constants:
    base_spots: dict[Zone, Point]
    server_spot: Point
    defense_spots: dict[Zone, Point]
    libero_replacement_spot: Point
    libero_id: str
    libero_serves_for: str


@dataclass(frozen=True)
class FormationsData:
    constants: Constants
    formations: tuple[Formation, ...]

    def find(self, system: str, rotation: int, phase: str) -> Formation:
        for formation in self.formations:
            if (formation.system, formation.rotation, formation.phase) == (system, rotation, phase):
                return formation
        raise KeyError(f"No {system} formation for rotation {rotation}, phase {phase}")


def _point(raw: dict[str, Any]) -> Point:
    return Point(x=float(raw["x"]), y=float(raw["y"]))


def _spots(raw: dict[str, Any]) -> dict[Zone, Point]:
    return {int(zone): _point(p) for zone, p in raw.items()}


def load_formations(path: Path = DEFAULT_PATH) -> FormationsData:
    raw = json.loads(path.read_text(encoding="utf-8"))
    c = raw["constants"]
    constants = Constants(
        base_spots=_spots(c["baseSpots"]),
        server_spot=_point(c["serverSpot"]),
        defense_spots=_spots(c["defenseSpots"]),
        libero_replacement_spot=_point(c["liberoReplacementSpot"]),
        libero_id=c["libero"]["id"],
        libero_serves_for=c["liberoServesFor"],
    )
    formations = tuple(
        Formation(
            id=f["id"],
            system=f["system"],
            rotation=int(f["rotation"]),
            phase=f["phase"],
            players=tuple(
                FormationPlayer(
                    id=p["id"],
                    role=p["role"],
                    label=p["label"],
                    zone=int(p["zone"]),
                    position=_point(p["position"]),
                )
                for p in f["players"]
            ),
        )
        for f in raw["formations"]
    )
    return FormationsData(constants=constants, formations=formations)
