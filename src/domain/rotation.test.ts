import { describe, expect, it } from 'vitest';
import { rotateClockwise } from './rotation';
import type { ZoneMap } from './types';

describe('rotateClockwise', () => {
  const start: ZoneMap<string> = { 1: 'a', 2: 'b', 3: 'c', 4: 'd', 5: 'e', 6: 'f' };

  it('moves every player one zone clockwise', () => {
    expect(rotateClockwise(start)).toEqual({ 1: 'b', 6: 'a', 5: 'f', 4: 'e', 3: 'd', 2: 'c' });
  });

  it('returns to the start after six rotations', () => {
    let current = start;
    for (let i = 0; i < 6; i++) current = rotateClockwise(current);
    expect(current).toEqual(start);
  });
});
