import { describe, expect, it } from 'vitest';
import { findOverlapViolations } from '../../domain/overlap';
import type { Point, ZoneMap } from '../../domain/types';
import { findFormation } from '../catalog';
import { findLesson, LESSONS, resolveCourt } from './index';

const allSteps = LESSONS.flatMap((lesson) =>
  lesson.steps.map((step, i) => ({ lesson: lesson.id, index: i + 1, step })),
);

function lineupOf(court: Parameters<typeof resolveCourt>[0]): ZoneMap<Point> {
  const { players, zones } = resolveCourt(court);
  const byId = new Map(players.map((p) => [p.id, p.position]));
  return Object.fromEntries(
    Object.entries(zones).map(([zone, id]) => [zone, byId.get(id)!]),
  ) as ZoneMap<Point>;
}

describe('lessons', () => {
  it('have unique URL-safe ids and at least one step', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const lesson of LESSONS) {
      expect(lesson.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(lesson.steps.length).toBeGreaterThan(0);
    }
  });

  it('are found by id', () => {
    expect(findLesson('overlap-rule')?.title).toBe('The overlap rule');
    expect(findLesson('nope')).toBeUndefined();
    expect(findLesson(undefined)).toBeUndefined();
  });

  it.each(allSteps)('$lesson step $index has text', ({ step }) => {
    expect(step.title.trim()).not.toBe('');
    expect(step.body.length).toBeGreaterThan(0);
    for (const paragraph of step.body) expect(paragraph.trim()).not.toBe('');
  });

  it.each(allSteps)('$lesson step $index points to a formation that exists', ({ step }) => {
    if (step.court.kind === 'formation') {
      const { system, rotation, phase } = step.court;
      expect(findFormation(system, rotation, phase)).toBeDefined();
    }
  });

  it.each(allSteps)('$lesson step $index highlights only players on court', ({ step }) => {
    const ids = resolveCourt(step.court).players.map((p) => p.id);
    for (const id of step.highlight ?? []) expect(ids).toContain(id);
  });

  it.each(allSteps.filter(({ step }) => step.court.kind === 'lineup'))(
    '$lesson step $index (explicit lineup) has one player per zone',
    ({ step }) => {
      if (step.court.kind !== 'lineup') return;
      expect(step.court.players.map((p) => p.zone).sort()).toEqual([1, 2, 3, 4, 5, 6]);
      expect(new Set(step.court.players.map((p) => p.id)).size).toBe(6);
    },
  );
});

describe('the overlap rule lesson', () => {
  const steps = findLesson('overlap-rule')!.steps;

  it('shows the faults its illegal examples describe', () => {
    const faults = steps
      .filter((s) => s.title.startsWith('Illegal'))
      .map((s) => findOverlapViolations(lineupOf(s.court)));
    expect(faults).toEqual([
      [{ kind: 'front-back', front: 2, back: 1 }],
      [{ kind: 'left-right', left: 5, right: 6 }],
    ]);
  });

  it('keeps every other step legal', () => {
    for (const step of steps.filter((s) => !s.title.startsWith('Illegal'))) {
      expect(findOverlapViolations(lineupOf(step.court))).toEqual([]);
    }
  });
});

describe('the 5-1 serve receive lesson', () => {
  it('has one step per rotation, in playing order', () => {
    const titles = findLesson('5-1-serve-receive')!
      .steps.slice(1)
      .map((s) => s.title);
    expect(titles).toEqual([1, 6, 5, 4, 3, 2].map((r) => `Rotation ${r}`));
  });
});
