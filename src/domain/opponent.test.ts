import { describe, expect, it } from 'vitest';
import { toOpponentFrame } from './opponent';

describe('toOpponentFrame', () => {
  it('maps their end-line left corner (0, 0) to (9, 18) in the shared frame', () => {
    expect(toOpponentFrame({ x: 0, y: 0 })).toEqual({ x: 9, y: 18 });
  });

  it('maps their right-back base spot to our left side, near their end line', () => {
    expect(toOpponentFrame({ x: 7.5, y: 3 })).toEqual({ x: 1.5, y: 15 });
  });

  it('keeps the net and the court centre in place', () => {
    expect(toOpponentFrame({ x: 4.5, y: 9 })).toEqual({ x: 4.5, y: 9 });
  });

  it('is its own inverse', () => {
    for (const p of [
      { x: 0, y: 0 },
      { x: 7.5, y: -1 },
      { x: 2.25, y: 13.7 },
      { x: -1, y: 20 },
    ]) {
      expect(toOpponentFrame(toOpponentFrame(p))).toEqual(p);
    }
  });
});
