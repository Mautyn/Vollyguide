"""Rallies from player movement, refined with referee whistles.

Between rallies players walk, talk and line up; during a rally they move fast. We measure
the typical speed of the analysed team's players over time, find bursts of movement, and
use whistles to place the start (the whistle that allows the serve) and the end.
The suggested serve time is when movement rises after the quiet moment before the serve;
it is confirmed by a person later (issue #42).
"""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np

from .audio import Whistle
from .tracks import Tracks


@dataclass(frozen=True)
class RallyConfig:
    smooth_s: float = 1.0
    high_speed: float = 1.3  # m/s, typical player speed that starts a rally
    low_speed: float = 0.8  # m/s, speed that ends it (hysteresis)
    min_rally_s: float = 3.0
    merge_gap_s: float = 2.0
    max_step_s: float = 0.6  # longer gaps in a track are not used for speed
    start_whistle_before_s: float = 12.0
    end_whistle_after_s: float = 4.0
    serve_lookback_s: float = 8.0


@dataclass(frozen=True)
class Rally:
    index: int
    start_s: float
    serve_s: float
    end_s: float
    our_serve: bool
    start_whistle_s: float | None
    end_whistle_s: float | None


def activity(tracks: Tracks, config: RallyConfig | None = None) -> tuple[np.ndarray, np.ndarray]:
    """(times, median player speed in m/s), smoothed over `smooth_s`."""
    config = config or RallyConfig()
    times = tracks.times()
    if len(times) == 0:
        return times, np.zeros(0)
    speeds_at: dict[float, list[float]] = {}
    order = np.lexsort((tracks.time_s, tracks.track_id))
    tid, t, x, y = (tracks.track_id[order], tracks.time_s[order], tracks.x_m[order],
                    tracks.y_m[order])  # fmt: skip
    same = tid[1:] == tid[:-1]
    dt = t[1:] - t[:-1]
    usable = same & (dt > 0) & (dt <= config.max_step_s)
    speed = np.hypot(x[1:] - x[:-1], y[1:] - y[:-1]) / np.where(dt > 0, dt, 1)
    for time_s, s in zip(t[1:][usable], speed[usable], strict=True):
        speeds_at.setdefault(float(time_s), []).append(float(s))
    raw = np.array([np.median(speeds_at[float(ts)]) if float(ts) in speeds_at else 0.0
                    for ts in times])  # fmt: skip
    step = np.median(np.diff(times)) if len(times) > 1 else 1.0
    width = max(1, int(round(config.smooth_s / step)))
    kernel = np.ones(width) / width
    return times, np.convolve(raw, kernel, mode="same")


def movement_segments(
    times: np.ndarray, speed: np.ndarray, config: RallyConfig | None = None
) -> list[tuple[float, float]]:
    """Bursts of movement: above `high_speed` to start, until below `low_speed`; short gaps
    are merged and short bursts dropped."""
    config = config or RallyConfig()
    segments: list[list[float]] = []
    inside = False
    for t, s in zip(times, speed, strict=True):
        if not inside and s >= config.high_speed:
            inside = True
            segments.append([float(t), float(t)])
        elif inside:
            if s < config.low_speed:
                inside = False
            else:
                segments[-1][1] = float(t)
    merged: list[list[float]] = []
    for seg in segments:
        if merged and seg[0] - merged[-1][1] <= config.merge_gap_s:
            merged[-1][1] = seg[1]
        else:
            merged.append(seg)
    return [(s, e) for s, e in merged if e - s >= config.min_rally_s]


def _suggest_serve(
    times: np.ndarray, speed: np.ndarray, start: float, earliest: float, config: RallyConfig
) -> float:
    window = (times >= max(earliest, start - config.serve_lookback_s)) & (times <= start)
    if not window.any():
        return start
    t_win, s_win = times[window], speed[window]
    quiet = int(np.argmin(s_win))
    rise = (s_win[quiet] + config.low_speed) / 2
    after = np.flatnonzero(s_win[quiet:] >= rise)
    return float(t_win[quiet + after[0]]) if len(after) else start


def _is_our_serve(tracks: Tracks, serve_s: float) -> bool:
    """Someone of the analysed team stands behind their end line, between the sidelines."""
    near = (tracks.time_s >= serve_s - 2.0) & (tracks.time_s <= serve_s + 0.5)
    behind = (tracks.y_m < -0.2) & (tracks.x_m >= 0) & (tracks.x_m <= 9)
    return bool((near & behind).any())


def find_rallies(
    tracks: Tracks, whistles: list[Whistle] | None = None, config: RallyConfig | None = None
) -> list[Rally]:
    config = config or RallyConfig()
    whistles = whistles or []
    times, speed = activity(tracks, config)
    rallies: list[Rally] = []
    for start, end in movement_segments(times, speed, config):
        before = [w.start_s for w in whistles
                  if start - config.start_whistle_before_s <= w.start_s <= start + 1.0]  # fmt: skip
        after = [w.start_s for w in whistles
                 if end - 3.0 <= w.start_s <= end + config.end_whistle_after_s]  # fmt: skip
        start_whistle = max(before) if before else None
        end_whistle = min(after) if after else None
        earliest = start_whistle if start_whistle is not None else start - config.serve_lookback_s
        serve = _suggest_serve(times, speed, start, earliest, config)
        rallies.append(
            Rally(
                index=len(rallies) + 1,
                start_s=start_whistle if start_whistle is not None else serve,
                serve_s=serve,
                end_s=end_whistle if end_whistle is not None else end,
                our_serve=_is_our_serve(tracks, serve),
                start_whistle_s=start_whistle,
                end_whistle_s=end_whistle,
            )
        )
    return rallies


def save_rallies(path: Path, rallies: list[Rally], meta: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {**meta, "rallies": [asdict(r) for r in rallies]}
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def load_rallies(path: Path) -> list[Rally]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    return [Rally(**r) for r in raw["rallies"]]


@dataclass(frozen=True)
class Evaluation:
    found: int
    truth: int
    detected: int
    missed: list[float]
    extra: list[float]

    @property
    def recall(self) -> float:
        return self.found / self.truth if self.truth else 1.0

    @property
    def precision(self) -> float:
        return self.found / self.detected if self.detected else 1.0


def evaluate(
    rallies: list[Rally], truth_serves_s: list[float], tolerance_s: float = 2.5
) -> Evaluation:
    """Matches detected serves to hand-noted serve times (each used once, closest first)."""
    detected = sorted(r.serve_s for r in rallies)
    truth = sorted(truth_serves_s)
    pairs = sorted(
        (abs(d - t), i, j) for i, d in enumerate(detected) for j, t in enumerate(truth)
        if abs(d - t) <= tolerance_s
    )  # fmt: skip
    used_d: set[int] = set()
    used_t: set[int] = set()
    for _, i, j in pairs:
        if i not in used_d and j not in used_t:
            used_d.add(i)
            used_t.add(j)
    return Evaluation(
        found=len(used_t),
        truth=len(truth),
        detected=len(detected),
        missed=[t for j, t in enumerate(truth) if j not in used_t],
        extra=[d for i, d in enumerate(detected) if i not in used_d],
    )
