"""Player tracks in court meters, and which court area counts as the analysed team's.

Tracks are stored as columns in a compressed .npz file (one row per player per sampled
frame), plus a small JSON file describing how they were made.
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np

from .court import COURT_WIDTH, NET_Y


@dataclass(frozen=True)
class CourtArea:
    """Where the analysed team's players can be, in their own frame (y = 0 at their end
    line). Defaults: their half with a margin, the serving area behind the end line, and
    not the referee stands at the net posts. People outside (the other team, the bench,
    line judges, spectators) are dropped."""

    min_x: float = -1.5
    max_x: float = COURT_WIDTH + 1.5
    min_y: float = -4.0
    max_y: float = NET_Y + 0.3
    referee_post_radius: float = 1.0

    def contains(self, x: np.ndarray, y: np.ndarray) -> np.ndarray:
        x = np.asarray(x, dtype=float)
        y = np.asarray(y, dtype=float)
        inside = (x >= self.min_x) & (x <= self.max_x) & (y >= self.min_y) & (y <= self.max_y)
        # Referees stand next to the net posts, just outside the sidelines.
        near_left_post = np.hypot(x - (-0.5), y - NET_Y) < self.referee_post_radius
        near_right_post = np.hypot(x - (COURT_WIDTH + 0.5), y - NET_Y) < self.referee_post_radius
        outside_lines = (x < 0) | (x > COURT_WIDTH)
        return inside & ~((near_left_post | near_right_post) & outside_lines)


COLUMNS = ("time_s", "frame", "track_id", "x_m", "y_m", "confidence", "x1", "y1", "x2", "y2")


@dataclass
class Tracks:
    """One row per tracked person per sampled frame. Box columns are pixels."""

    time_s: np.ndarray
    frame: np.ndarray
    track_id: np.ndarray
    x_m: np.ndarray
    y_m: np.ndarray
    confidence: np.ndarray
    x1: np.ndarray
    y1: np.ndarray
    x2: np.ndarray
    y2: np.ndarray

    @staticmethod
    def empty() -> Tracks:
        return Tracks(*(np.zeros(0) for _ in COLUMNS))

    @staticmethod
    def from_rows(rows: list[tuple[float, ...]]) -> Tracks:
        if not rows:
            return Tracks.empty()
        array = np.asarray(rows, dtype=float)
        return Tracks(*(array[:, i] for i in range(len(COLUMNS))))

    def __len__(self) -> int:
        return len(self.time_s)

    def select(self, mask: np.ndarray) -> Tracks:
        return Tracks(*(getattr(self, c)[mask] for c in COLUMNS))

    def times(self) -> np.ndarray:
        """The sampled times that have at least one person, sorted."""
        return np.unique(self.time_s)

    def save(self, path: Path, meta: dict) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        np.savez_compressed(
            path,
            **{
                c: getattr(self, c).astype(np.int64 if c in ("frame", "track_id") else np.float32)
                for c in COLUMNS
            },
        )
        path.with_suffix(".json").write_text(json.dumps(meta, indent=2) + "\n", encoding="utf-8")

    @staticmethod
    def load(path: Path) -> tuple[Tracks, dict]:
        with np.load(path) as data:
            tracks = Tracks(*(data[c].astype(float) for c in COLUMNS))
        meta_path = path.with_suffix(".json")
        meta = json.loads(meta_path.read_text(encoding="utf-8")) if meta_path.exists() else {}
        return tracks, meta


def area_as_dict(area: CourtArea) -> dict:
    return asdict(area)
