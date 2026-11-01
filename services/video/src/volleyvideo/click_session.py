"""The order of clicks during calibration, without any GUI (so it can be tested)."""

from __future__ import annotations

from dataclasses import dataclass, field

from .court import LANDMARKS, LINE_MARKS, MIN_LANDMARKS


@dataclass(frozen=True)
class Target:
    key: str
    optional: bool


TARGETS: tuple[Target, ...] = tuple(Target(m.key, False) for m in LANDMARKS) + tuple(
    Target(m.key, True) for m in LINE_MARKS
)
LANDMARK_KEYS = frozenset(m.key for m in LANDMARKS)


@dataclass
class ClickSession:
    """Steps through TARGETS: click sets a point, skip leaves it out, undo goes back."""

    index: int = 0
    points: dict[str, tuple[float, float]] = field(default_factory=dict)
    _history: list[tuple[int, str | None]] = field(default_factory=list)

    @property
    def current(self) -> Target | None:
        return TARGETS[self.index] if self.index < len(TARGETS) else None

    @property
    def finished(self) -> bool:
        return self.current is None

    def click(self, x: float, y: float) -> None:
        target = self.current
        if target is None:
            return
        self.points[target.key] = (x, y)
        self._history.append((self.index, target.key))
        self.index += 1

    def skip(self) -> None:
        if self.current is None:
            return
        self._history.append((self.index, None))
        self.index += 1

    def undo(self) -> None:
        if not self._history:
            return
        index, key = self._history.pop()
        if key is not None:
            del self.points[key]
        self.index = index

    @property
    def landmarks(self) -> dict[str, tuple[float, float]]:
        return {k: v for k, v in self.points.items() if k in LANDMARK_KEYS}

    @property
    def line_marks(self) -> dict[str, tuple[float, float]]:
        return {k: v for k, v in self.points.items() if k not in LANDMARK_KEYS}

    @property
    def enough(self) -> bool:
        return len(self.landmarks) >= MIN_LANDMARKS
