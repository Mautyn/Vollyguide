import type { Point } from './types';

export function interpolatePoint(from: Point, to: Point, t: number): Point {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}

/**
 * Positions part-way between two lineups, for animation. `t` runs from 0 (`from`)
 * to 1 (`to`) and is clamped to that range. Keys missing from `from` start at `to`.
 */
export function interpolate<K extends PropertyKey>(
  from: Partial<Record<K, Point>>,
  to: Record<K, Point>,
  t: number,
): Record<K, Point> {
  const clamped = Math.min(1, Math.max(0, t));
  const result = {} as Record<K, Point>;
  for (const key of Object.keys(to) as K[]) {
    const end = to[key];
    result[key] = interpolatePoint(from[key] ?? end, end, clamped);
  }
  return result;
}

/** Smooth start and stop (cubic ease-in-out), mapping 0..1 onto 0..1. */
export function easeInOut(t: number): number {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
}
