import { findOverlapViolations, type OverlapViolation } from './overlap';
import type { Point, Zone, ZoneMap } from './types';

export const DEFAULT_TOLERANCE_M = 1.0;

/** Where a player should stand, and the zone they occupy at the moment of serve. */
export interface TargetSpot {
  id: string;
  zone: Zone;
  position: Point;
}

export type PlayerGrade =
  | { id: string; result: 'correct'; distance: number }
  | { id: string; result: 'off'; distance: number };

export interface PlacementGrade {
  players: PlayerGrade[];
  correctCount: number;
  /** Whether the placed lineup passes the overlap rule (zones taken from the target). */
  legal: boolean;
  violations: OverlapViolation[];
}

export function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Grades where the learner placed each player. A player within `toleranceMeters`
 * of their target spot (boundary included) is correct. A player missing from
 * `placed` is off by an infinite distance and makes the lineup illegal.
 */
export function gradePlacement(
  target: readonly TargetSpot[],
  placed: Readonly<Record<string, Point>>,
  toleranceMeters: number = DEFAULT_TOLERANCE_M,
): PlacementGrade {
  const players: PlayerGrade[] = target.map(({ id, position }) => {
    const at = placed[id];
    const distance = at ? distanceBetween(at, position) : Infinity;
    return { id, result: distance <= toleranceMeters ? 'correct' : 'off', distance };
  });

  const complete = target.every(({ id }) => placed[id]);
  const violations = complete
    ? findOverlapViolations(
        Object.fromEntries(target.map(({ id, zone }) => [zone, placed[id]!])) as ZoneMap<Point>,
      )
    : [];

  return {
    players,
    correctCount: players.filter((p) => p.result === 'correct').length,
    legal: complete && violations.length === 0,
    violations,
  };
}
