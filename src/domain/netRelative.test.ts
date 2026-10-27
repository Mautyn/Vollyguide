import { describe, expect, it } from 'vitest';
import { toNetRelative } from './netRelative';

describe('toNetRelative', () => {
  it('puts our attack line 3 m and our end line 9 m from the net', () => {
    expect(toNetRelative({ x: 4.5, y: 6 }, 'us').fromNet).toBe(3);
    expect(toNetRelative({ x: 4.5, y: 0 }, 'us').fromNet).toBe(9);
    expect(toNetRelative({ x: 4.5, y: 9 }, 'us').fromNet).toBe(0);
  });

  it('puts the opponent attack line 3 m and their end line 9 m from the net', () => {
    expect(toNetRelative({ x: 4.5, y: 12 }, 'them').fromNet).toBe(3);
    expect(toNetRelative({ x: 4.5, y: 18 }, 'them').fromNet).toBe(9);
  });

  it('measures width from each team’s own left sideline', () => {
    // Our right sideline is the opponent's left sideline.
    expect(toNetRelative({ x: 9, y: 4 }, 'us').fromLeft).toBe(9);
    expect(toNetRelative({ x: 9, y: 14 }, 'them').fromLeft).toBe(0);
    expect(toNetRelative({ x: 1.5, y: 7.5 }, 'us')).toEqual({ fromNet: 1.5, fromLeft: 1.5 });
  });

  it('allows positions behind the end line and outside the sidelines', () => {
    expect(toNetRelative({ x: 7.5, y: -1 }, 'us')).toEqual({ fromNet: 10, fromLeft: 7.5 });
    expect(toNetRelative({ x: 1.5, y: 19 }, 'them')).toEqual({ fromNet: 10, fromLeft: 7.5 });
    expect(toNetRelative({ x: -1.5, y: 3 }, 'us').fromLeft).toBe(-1.5);
  });

  it('gives a negative distance for a player across the net', () => {
    expect(toNetRelative({ x: 4.5, y: 10 }, 'us').fromNet).toBe(-1);
  });
});
