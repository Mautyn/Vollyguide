import type { Point } from './types';

/**
 * Coordinates in meters: x = 0..9 left to right as seen from behind our own end line;
 * y = 0 at our end line, net at y = 9, opponent end line at y = 18.
 */
export const COURT_WIDTH = 9;
export const COURT_LENGTH = 18;
export const NET_Y = 9;
export const OUR_ATTACK_LINE_Y = 6;
export const THEIR_ATTACK_LINE_Y = 12;

/** Free zone around the court where players may stand (e.g. the server). */
export const FREE_ZONE = 3;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Keeps a point inside the court plus the free zone. */
export function clampToPlayableArea(point: Point): Point {
  return {
    x: clamp(point.x, -FREE_ZONE, COURT_WIDTH + FREE_ZONE),
    y: clamp(point.y, -FREE_ZONE, COURT_LENGTH + FREE_ZONE),
  };
}

export function isInsideCourt(point: Point): boolean {
  return point.x >= 0 && point.x <= COURT_WIDTH && point.y >= 0 && point.y <= COURT_LENGTH;
}
