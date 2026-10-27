import { describe, expect, it } from 'vitest';
import { easeInOut, interpolate } from './interpolate';
import type { Point, ZoneMap } from './types';

const from: ZoneMap<Point> = {
  1: { x: 7.5, y: 3 },
  2: { x: 7.5, y: 7.5 },
  3: { x: 4.5, y: 7.5 },
  4: { x: 1.5, y: 7.5 },
  5: { x: 1.5, y: 3 },
  6: { x: 4.5, y: 3 },
};
const to: ZoneMap<Point> = {
  1: { x: 8.5, y: 3.5 },
  2: { x: 7.5, y: 4 },
  3: { x: 4.5, y: 8.5 },
  4: { x: 1, y: 8.5 },
  5: { x: 1.5, y: 4 },
  6: { x: 4.5, y: 4 },
};

describe('interpolate', () => {
  it('returns the start lineup at t = 0', () => {
    expect(interpolate(from, to, 0)).toEqual(from);
  });

  it('returns the end lineup at t = 1', () => {
    expect(interpolate(from, to, 1)).toEqual(to);
  });

  it('returns the midpoint at t = 0.5', () => {
    const mid = interpolate(from, to, 0.5);
    expect(mid[1]).toEqual({ x: 8, y: 3.25 });
    expect(mid[2]).toEqual({ x: 7.5, y: 5.75 });
    expect(mid[4]).toEqual({ x: 1.25, y: 8 });
  });

  it('clamps t to 0..1', () => {
    expect(interpolate(from, to, -1)).toEqual(from);
    expect(interpolate(from, to, 2)).toEqual(to);
  });

  it('starts keys missing from the start lineup at their end position', () => {
    const result = interpolate<string>({}, { s: { x: 1, y: 2 } }, 0);
    expect(result).toEqual({ s: { x: 1, y: 2 } });
  });

  it('does not modify its inputs', () => {
    const copy = structuredClone(from);
    interpolate(from, to, 0.3);
    expect(from).toEqual(copy);
  });
});

describe('easeInOut', () => {
  it('maps 0, 0.5 and 1 onto themselves and clamps outside', () => {
    expect(easeInOut(0)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(1)).toBe(1);
    expect(easeInOut(-1)).toBe(0);
    expect(easeInOut(3)).toBe(1);
  });

  it('starts and ends slowly', () => {
    expect(easeInOut(0.1)).toBeLessThan(0.1);
    expect(easeInOut(0.9)).toBeGreaterThan(0.9);
  });
});
