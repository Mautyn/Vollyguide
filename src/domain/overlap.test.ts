import { describe, expect, it } from 'vitest';
import type { Point, ZoneMap } from './types';
import { findOverlapViolations, isLegalLineup } from './overlap';

/** Standard base positions: front row at y = 7.5, back row at y = 3. */
function baseLineup(): ZoneMap<Point> {
  return {
    4: { x: 1.5, y: 7.5 },
    3: { x: 4.5, y: 7.5 },
    2: { x: 7.5, y: 7.5 },
    5: { x: 1.5, y: 3 },
    6: { x: 4.5, y: 3 },
    1: { x: 7.5, y: 3 },
  };
}

describe('findOverlapViolations', () => {
  it('accepts the standard base lineup', () => {
    expect(findOverlapViolations(baseLineup())).toEqual([]);
    expect(isLegalLineup(baseLineup())).toBe(true);
  });

  it('accepts a stacked serve-receive lineup that keeps the required order', () => {
    // Setter in 1 hides just behind the right-front player; others shifted.
    const lineup: ZoneMap<Point> = {
      4: { x: 0.5, y: 8.5 },
      3: { x: 3.0, y: 8.0 },
      2: { x: 8.0, y: 8.5 },
      5: { x: 1.0, y: 4.0 },
      6: { x: 4.5, y: 3.5 },
      1: { x: 8.5, y: 8.0 },
    };
    expect(isLegalLineup(lineup)).toBe(true);
  });

  it('accepts players standing outside the court lines', () => {
    const lineup = baseLineup();
    lineup[5] = { x: -0.5, y: 2 };
    lineup[1] = { x: 9.5, y: 2 };
    expect(isLegalLineup(lineup)).toBe(true);
  });

  it.each([
    [4, 5],
    [3, 6],
    [2, 1],
  ] as const)('flags back-row player %i/%i ahead of the front-row player', (front, back) => {
    const lineup = baseLineup();
    lineup[back] = { ...lineup[back], y: 8 };
    expect(findOverlapViolations(lineup)).toEqual([{ kind: 'front-back', front, back }]);
  });

  it('flags a front and back player level with each other', () => {
    const lineup = baseLineup();
    lineup[6] = { ...lineup[6], y: 7.5 };
    expect(findOverlapViolations(lineup)).toEqual([{ kind: 'front-back', front: 3, back: 6 }]);
  });

  it('flags front-row players out of left-to-right order', () => {
    const lineup = baseLineup();
    lineup[3] = { ...lineup[3], x: 8 };
    expect(findOverlapViolations(lineup)).toEqual([{ kind: 'left-right', left: 3, right: 2 }]);
  });

  it('flags back-row players out of left-to-right order', () => {
    const lineup = baseLineup();
    lineup[5] = { ...lineup[5], x: 5 };
    expect(findOverlapViolations(lineup)).toEqual([{ kind: 'left-right', left: 5, right: 6 }]);
  });

  it('reports every violation in a badly broken lineup', () => {
    const lineup = baseLineup();
    // Swap 4 and 1 entirely.
    const four = lineup[4];
    lineup[4] = lineup[1];
    lineup[1] = four;
    expect(isLegalLineup(lineup)).toBe(false);
    expect(findOverlapViolations(lineup)).toEqual(
      expect.arrayContaining([
        { kind: 'front-back', front: 4, back: 5 },
        { kind: 'front-back', front: 2, back: 1 },
        { kind: 'left-right', left: 4, right: 3 },
        { kind: 'left-right', left: 6, right: 1 },
      ]),
    );
  });
});
