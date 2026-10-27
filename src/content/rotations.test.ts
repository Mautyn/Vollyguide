import { describe, expect, it } from 'vitest';
import { isLegalLineup } from '../domain/overlap';
import type { Point, Rotation, ZoneMap } from '../domain/types';
import { BASE_5_1_ROTATION_1, BASE_SPOTS } from './formations';
import { BASE_5_1_ROTATIONS, nextRotation, previousRotation, ROTATION_ORDER } from './rotations';

const ALL: Rotation[] = [1, 2, 3, 4, 5, 6];

describe('5-1 base rotations', () => {
  it.each(ALL)(
    'rotation %i has one player per zone, the setter in that zone, and is legal',
    (r) => {
      const formation = BASE_5_1_ROTATIONS[r];
      expect(formation.rotation).toBe(r);
      expect(formation.players.map((p) => p.zone).sort()).toEqual([1, 2, 3, 4, 5, 6]);
      expect(formation.players.find((p) => p.role === 'S')?.zone).toBe(r);

      const lineup = Object.fromEntries(
        formation.players.map((p) => [p.zone, p.position]),
      ) as ZoneMap<Point>;
      expect(isLegalLineup(lineup)).toBe(true);
      for (const player of formation.players)
        expect(player.position).toEqual(BASE_SPOTS[player.zone]);
    },
  );

  it('rotation 1 matches the hand-written base formation', () => {
    expect(BASE_5_1_ROTATIONS[1].players).toEqual(BASE_5_1_ROTATION_1.players);
  });

  it('keeps the setter opposite the opposite and the middles opposite each other', () => {
    const opposite: ZoneMap<number> = { 1: 4, 2: 5, 3: 6, 4: 1, 5: 2, 6: 3 };
    for (const r of ALL) {
      const zoneOf = (id: string) => BASE_5_1_ROTATIONS[r].players.find((p) => p.id === id)!.zone;
      expect(zoneOf('opp')).toBe(opposite[zoneOf('s')]);
      expect(zoneOf('mb2')).toBe(opposite[zoneOf('mb1')]);
    }
  });

  it('keeps the same roster order in every rotation', () => {
    const ids = BASE_5_1_ROTATION_1.players.map((p) => p.id);
    for (const r of ALL) expect(BASE_5_1_ROTATIONS[r].players.map((p) => p.id)).toEqual(ids);
  });
});

describe('rotation order', () => {
  it('follows the playing order 1, 6, 5, 4, 3, 2 and wraps around', () => {
    expect(ROTATION_ORDER).toEqual([1, 6, 5, 4, 3, 2]);
    expect(nextRotation(1)).toBe(6);
    expect(nextRotation(2)).toBe(1);
    expect(previousRotation(1)).toBe(2);
    expect(previousRotation(6)).toBe(1);
  });
});
