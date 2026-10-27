import { describe, expect, it } from 'vitest';
import { isLegalLineup } from '../domain/overlap';
import type { Point, ZoneMap } from '../domain/types';
import { BASE_5_1_ROTATION_1 } from './formations';

describe('formations', () => {
  it('has one player in each zone and a legal lineup', () => {
    const lineup = Object.fromEntries(
      BASE_5_1_ROTATION_1.players.map((p) => [p.zone, p.position]),
    ) as ZoneMap<Point>;
    expect(Object.keys(lineup).sort()).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(isLegalLineup(lineup)).toBe(true);
  });
});
