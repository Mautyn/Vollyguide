import type { Zone } from './types';

export const ZONES: readonly Zone[] = [1, 2, 3, 4, 5, 6];

/** Front row, left to right. */
export const FRONT_ROW: readonly [Zone, Zone, Zone] = [4, 3, 2];
/** Back row, left to right. */
export const BACK_ROW: readonly [Zone, Zone, Zone] = [5, 6, 1];

export function isFrontRow(zone: Zone): boolean {
  return zone === 2 || zone === 3 || zone === 4;
}

/** The back-row zone directly behind a front-row zone. */
export const ZONE_BEHIND: Readonly<Record<2 | 3 | 4, Zone>> = { 4: 5, 3: 6, 2: 1 };
