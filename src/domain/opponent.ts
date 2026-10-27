import { COURT_LENGTH, COURT_WIDTH } from './court';
import type { Point } from './types';

/**
 * Converts a point between the opponent's own frame (y = 0 at their end line, x left to
 * right as seen from behind their end line) and our shared court frame. The court is
 * rotated by 180°, so the same function converts in both directions.
 */
export function toOpponentFrame(point: Point): Point {
  return { x: COURT_WIDTH - point.x, y: COURT_LENGTH - point.y };
}
