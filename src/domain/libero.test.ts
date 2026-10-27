import { describe, expect, it } from 'vitest';
import { applyLibero, findLiberoViolations, type RosterEntry } from './libero';
import { rotateClockwise } from './rotation';
import type { Role, ZoneMap } from './types';
import { isFrontRow } from './zones';

const roster: RosterEntry[] = [
  { id: 's', role: 'S' },
  { id: 'oh1', role: 'OH' },
  { id: 'mb2', role: 'MB' },
  { id: 'opp', role: 'OPP' },
  { id: 'oh2', role: 'OH' },
  { id: 'mb1', role: 'MB' },
];
const libero: RosterEntry = { id: 'l', role: 'L' };
const roles: Record<string, Role> = Object.fromEntries(
  [...roster, libero].map((p) => [p.id, p.role]),
);

/** Rotation 1 of a 5-1, then the five rotations that follow. */
function allRotations(): ZoneMap<string>[] {
  let zones: ZoneMap<string> = { 1: 's', 2: 'oh1', 3: 'mb2', 4: 'opp', 5: 'oh2', 6: 'mb1' };
  const result = [zones];
  for (let i = 0; i < 5; i++) result.push((zones = rotateClockwise(zones)));
  return result;
}

describe('applyLibero', () => {
  it.each(allRotations().map((zones, i) => [i, zones] as const))(
    'replaces exactly the back-row middle blocker (rotation step %i)',
    (_, zones) => {
      const { zones: withL, replaced } = applyLibero(zones, roster, libero);
      const changed = (Object.keys(zones) as unknown as (keyof typeof zones)[]).filter(
        (z) => zones[z] !== withL[z],
      );
      expect(changed).toHaveLength(1);
      const zone = Number(changed[0]) as keyof typeof zones;
      expect(withL[zone]).toBe('l');
      expect(replaced).toBe(zones[zone]);
      expect(roles[replaced!]).toBe('MB');
      expect(isFrontRow(zone)).toBe(false);
      expect(findLiberoViolations(withL, roles)).toEqual([]);
    },
  );

  it('leaves the zones unchanged when no MB is in the back row', () => {
    const zones: ZoneMap<string> = { 1: 's', 2: 'mb1', 3: 'mb2', 4: 'opp', 5: 'oh2', 6: 'oh1' };
    expect(applyLibero(zones, roster, libero)).toEqual({ zones, replaced: null });
  });

  it('does not modify its input', () => {
    const zones = allRotations()[0]!;
    const copy = { ...zones };
    applyLibero(zones, roster, libero);
    expect(zones).toEqual(copy);
  });
});

describe('findLiberoViolations', () => {
  it.each([2, 3, 4] as const)('flags the libero in front-row zone %i', (zone) => {
    const zones: ZoneMap<string> = { 1: 's', 2: 'oh1', 3: 'mb2', 4: 'opp', 5: 'oh2', 6: 'mb1' };
    zones[zone] = 'l';
    expect(findLiberoViolations(zones, roles)).toEqual([{ kind: 'front-row', zone, id: 'l' }]);
  });

  it('accepts the libero in each back-row zone', () => {
    for (const zone of [1, 5, 6] as const) {
      const zones: ZoneMap<string> = { 1: 's', 2: 'oh1', 3: 'mb2', 4: 'opp', 5: 'oh2', 6: 'mb1' };
      zones[zone] = 'l';
      expect(findLiberoViolations(zones, roles)).toEqual([]);
    }
  });

  it('flags two liberos on court', () => {
    const zones: ZoneMap<string> = { 1: 's', 2: 'oh1', 3: 'mb2', 4: 'opp', 5: 'l', 6: 'l2' };
    expect(findLiberoViolations(zones, { ...roles, l2: 'L' })).toEqual([
      { kind: 'too-many', count: 2 },
    ]);
  });
});
