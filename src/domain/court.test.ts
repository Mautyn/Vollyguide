import { describe, expect, it } from 'vitest';
import { clampToPlayableArea, FREE_ZONE, isInsideCourt } from './court';

describe('court', () => {
  it('detects points inside the court', () => {
    expect(isInsideCourt({ x: 0, y: 0 })).toBe(true);
    expect(isInsideCourt({ x: 9, y: 18 })).toBe(true);
    expect(isInsideCourt({ x: -0.1, y: 5 })).toBe(false);
    expect(isInsideCourt({ x: 4, y: 18.1 })).toBe(false);
  });

  it('clamps points to the court plus free zone', () => {
    expect(clampToPlayableArea({ x: -10, y: 30 })).toEqual({ x: -FREE_ZONE, y: 18 + FREE_ZONE });
    expect(clampToPlayableArea({ x: 4, y: 5 })).toEqual({ x: 4, y: 5 });
  });
});
