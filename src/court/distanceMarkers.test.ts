import { describe, expect, it } from 'vitest';
import { toNetRelative } from '../domain/netRelative';
import { DISTANCE_MARKERS } from './distanceMarkers';

describe('DISTANCE_MARKERS', () => {
  it('marks the net once and 3, 6 and 9 m on both halves', () => {
    expect(DISTANCE_MARKERS.map((m) => m.label).sort()).toEqual(
      ['0 m', '3 m', '3 m', '6 m', '6 m', '9 m', '9 m'].sort(),
    );
  });

  it('places each label at the distance it names, for both teams', () => {
    for (const { y, label } of DISTANCE_MARKERS) {
      const team = y >= 9 ? 'them' : 'us';
      expect(`${toNetRelative({ x: 4.5, y }, team).fromNet} m`).toBe(label);
    }
  });
});
