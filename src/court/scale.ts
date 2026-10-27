import { COURT_LENGTH, COURT_WIDTH, FREE_ZONE } from '../domain/court';
import type { Point } from '../domain/types';

/**
 * Converts between court meters and stage pixels. This is the only place where
 * meters become pixels. Our end line is drawn at the bottom of the stage, the
 * opponent's at the top, and `margin` meters of free zone surround the court.
 */
export interface CourtScale {
  pxPerMeter: number;
  margin: number;
  stageWidth: number;
  stageHeight: number;
  toPixels(point: Point): Point;
  toMeters(pixel: Point): Point;
  lengthToPixels(meters: number): number;
}

export function createCourtScale(pxPerMeter: number, margin: number = FREE_ZONE): CourtScale {
  if (!(pxPerMeter > 0)) throw new Error('pxPerMeter must be positive');
  if (margin < 0) throw new Error('margin must not be negative');

  return {
    pxPerMeter,
    margin,
    stageWidth: (COURT_WIDTH + 2 * margin) * pxPerMeter,
    stageHeight: (COURT_LENGTH + 2 * margin) * pxPerMeter,
    toPixels: ({ x, y }) => ({
      x: (x + margin) * pxPerMeter,
      y: (COURT_LENGTH + margin - y) * pxPerMeter,
    }),
    toMeters: ({ x, y }) => ({
      x: x / pxPerMeter - margin,
      y: COURT_LENGTH + margin - y / pxPerMeter,
    }),
    lengthToPixels: (meters) => meters * pxPerMeter,
  };
}

/** The largest scale at which the court and margin fit inside the given box. */
export function fitCourtScale(maxWidth: number, maxHeight: number, margin: number = FREE_ZONE) {
  const pxPerMeter = Math.min(
    maxWidth / (COURT_WIDTH + 2 * margin),
    maxHeight / (COURT_LENGTH + 2 * margin),
  );
  return createCourtScale(Math.max(pxPerMeter, 1), margin);
}
