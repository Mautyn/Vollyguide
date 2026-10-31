// Runs the rule cases shared with the video pipeline (shared/rules/), so the TypeScript
// rules and their Python port (services/video/) must agree.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findLiberoViolations } from './libero';
import { findOverlapViolations } from './overlap';
import type { Point, Role, ZoneMap } from './types';

function load<T>(name: string): { cases: T[] } {
  return JSON.parse(readFileSync(resolve(process.cwd(), 'shared/rules', name), 'utf8'));
}

interface OverlapCase {
  name: string;
  lineup: Record<string, Point>;
  violations: unknown[];
}

interface LiberoCase {
  name: string;
  zones: Record<string, string>;
  roles: Record<string, Role>;
  violations: unknown[];
}

describe('shared overlap cases', () => {
  const { cases } = load<OverlapCase>('overlap-cases.json');
  it.each(cases.map((c) => [c.name, c] as const))('%s', (_name, c) => {
    expect(findOverlapViolations(c.lineup as unknown as ZoneMap<Point>)).toEqual(c.violations);
  });
});

describe('shared libero cases', () => {
  const { cases } = load<LiberoCase>('libero-cases.json');
  it.each(cases.map((c) => [c.name, c] as const))('%s', (_name, c) => {
    expect(findLiberoViolations(c.zones as unknown as ZoneMap<string>, c.roles)).toEqual(
      c.violations,
    );
  });
});
