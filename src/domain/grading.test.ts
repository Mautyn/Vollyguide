import { describe, expect, it } from 'vitest';
import { DEFAULT_TOLERANCE_M, gradePlacement, type TargetSpot } from './grading';
import type { Point } from './types';

const target: TargetSpot[] = [
  { id: 's', zone: 1, position: { x: 7.5, y: 3 } },
  { id: 'oh1', zone: 2, position: { x: 7.5, y: 7.5 } },
  { id: 'mb2', zone: 3, position: { x: 4.5, y: 7.5 } },
  { id: 'opp', zone: 4, position: { x: 1.5, y: 7.5 } },
  { id: 'oh2', zone: 5, position: { x: 1.5, y: 3 } },
  { id: 'mb1', zone: 6, position: { x: 4.5, y: 3 } },
];

const exact = (): Record<string, Point> =>
  Object.fromEntries(target.map((t) => [t.id, { ...t.position }]));

describe('gradePlacement', () => {
  it('scores an exact placement as all correct and legal', () => {
    const grade = gradePlacement(target, exact());
    expect(grade.correctCount).toBe(6);
    expect(grade.players.every((p) => p.result === 'correct' && p.distance === 0)).toBe(true);
    expect(grade.legal).toBe(true);
    expect(grade.violations).toEqual([]);
  });

  it('marks a player 1.5 m off as wrong, with the distance', () => {
    const placed = exact();
    placed.s = { x: 7.5, y: 1.5 };
    const grade = gradePlacement(target, placed);
    expect(grade.players.find((p) => p.id === 's')).toEqual({
      id: 's',
      result: 'off',
      distance: 1.5,
    });
    expect(grade.correctCount).toBe(5);
  });

  it('measures straight-line distance', () => {
    const placed = exact();
    placed.s = { x: 7.5 + 0.6, y: 3 + 0.8 };
    expect(gradePlacement(target, placed).players[0]!.distance).toBeCloseTo(1, 10);
  });

  it('includes the tolerance boundary and excludes anything beyond it', () => {
    expect(DEFAULT_TOLERANCE_M).toBe(1);
    const placed = exact();
    placed.s = { x: 7.5, y: 4 };
    expect(gradePlacement(target, placed).players[0]!.result).toBe('correct');
    placed.s = { x: 7.5, y: 4.01 };
    expect(gradePlacement(target, placed).players[0]!.result).toBe('off');
  });

  it('accepts a custom tolerance', () => {
    const placed = exact();
    placed.s = { x: 7.5, y: 4.5 };
    expect(gradePlacement(target, placed, 2).players[0]!.result).toBe('correct');
    expect(gradePlacement(target, placed, 0.5).players[0]!.result).toBe('off');
  });

  it('reports an illegal lineup even when every player is close to their spot', () => {
    // Rotation 1 serve receive: the setter (zone 1) hides just behind OH1 (zone 2).
    const receive: TargetSpot[] = [
      { id: 's', zone: 1, position: { x: 8.5, y: 3.5 } },
      { id: 'oh1', zone: 2, position: { x: 7.5, y: 4 } },
      { id: 'mb2', zone: 3, position: { x: 4.5, y: 8.5 } },
      { id: 'opp', zone: 4, position: { x: 1, y: 8.5 } },
      { id: 'oh2', zone: 5, position: { x: 1.5, y: 4 } },
      { id: 'mb1', zone: 6, position: { x: 4.5, y: 4 } },
    ];
    const placed = Object.fromEntries(receive.map((t) => [t.id, { ...t.position }]));
    // 0.7 m from the target, but now closer to the net than OH1.
    placed.s = { x: 8.5, y: 4.2 };

    const grade = gradePlacement(receive, placed);
    expect(grade.correctCount).toBe(6);
    expect(grade.legal).toBe(false);
    expect(grade.violations).toEqual([{ kind: 'front-back', front: 2, back: 1 }]);
  });

  it('treats a missing player as off and the lineup as illegal', () => {
    const placed = exact();
    delete placed.s;
    const grade = gradePlacement(target, placed);
    expect(grade.players[0]).toEqual({ id: 's', result: 'off', distance: Infinity });
    expect(grade.legal).toBe(false);
  });
});
