import type { ZoneMap } from './types';

/**
 * Rotates a team one position clockwise (after winning the serve back):
 * 2 -> 1, 1 -> 6, 6 -> 5, 5 -> 4, 4 -> 3, 3 -> 2.
 */
export function rotateClockwise<T>(assignment: ZoneMap<T>): ZoneMap<T> {
  return {
    1: assignment[2],
    6: assignment[1],
    5: assignment[6],
    4: assignment[5],
    3: assignment[4],
    2: assignment[3],
  };
}
