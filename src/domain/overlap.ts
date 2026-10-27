import type { Point, Zone, ZoneMap } from './types';
import { BACK_ROW, FRONT_ROW, ZONE_BEHIND } from './zones';

export type OverlapViolation =
  | { kind: 'front-back'; front: Zone; back: Zone }
  | { kind: 'left-right'; left: Zone; right: Zone };

/**
 * Checks the overlap rule at the moment of serve for the team whose end line is y = 0
 * (the net is in the +y direction):
 * - each front-row player is closer to the net than the back-row player behind them (4/5, 3/6, 2/1);
 * - within each row the left-to-right order is kept (4-3-2 in front, 5-6-1 in back).
 * Positions are the players' feet. Equal coordinates count as an overlap.
 */
export function findOverlapViolations(lineup: ZoneMap<Point>): OverlapViolation[] {
  const violations: OverlapViolation[] = [];

  for (const front of FRONT_ROW) {
    const back = ZONE_BEHIND[front as 2 | 3 | 4];
    if (!(lineup[front].y > lineup[back].y)) {
      violations.push({ kind: 'front-back', front, back });
    }
  }

  for (const row of [FRONT_ROW, BACK_ROW]) {
    for (let i = 0; i < row.length - 1; i++) {
      const left = row[i]!;
      const right = row[i + 1]!;
      if (!(lineup[left].x < lineup[right].x)) {
        violations.push({ kind: 'left-right', left, right });
      }
    }
  }

  return violations;
}

export function isLegalLineup(lineup: ZoneMap<Point>): boolean {
  return findOverlapViolations(lineup).length === 0;
}
