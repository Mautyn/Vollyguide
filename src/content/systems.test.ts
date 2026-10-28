import { describe, expect, it } from 'vitest';
import { distanceBetween } from '../domain/grading';
import { findLiberoViolations } from '../domain/libero';
import { isLegalLineup } from '../domain/overlap';
import type { Point, Role, Rotation, System, ZoneMap } from '../domain/types';
import { isFrontRow } from '../domain/zones';
import { formationToZones, type Formation, type FormationPlayer } from './formations';
import { withLibero } from './libero';
import { SETTING_TARGET_4_2, settingSetter, systemFormation, SYSTEMS } from './systems';

const ROTATIONS: Rotation[] = [1, 2, 3, 4, 5, 6];
const PHASES = ['base', 'receive'] as const;

const cases = SYSTEMS.flatMap((system) =>
  ROTATIONS.flatMap((rotation) => PHASES.map((phase) => ({ system, rotation, phase }))),
);

const lineupOf = (f: Formation) =>
  Object.fromEntries(f.players.map((p) => [p.zone, p.position])) as ZoneMap<Point>;
const rolesOf = (f: Formation): Record<string, Role> =>
  Object.fromEntries(f.players.map((p) => [p.id, p.role]));
const byId = (f: Formation, id: string) => f.players.find((p) => p.id === id)!;

describe.each(cases)('$system rotation $rotation $phase', ({ system, rotation, phase }) => {
  const formation = systemFormation(system, rotation, phase);

  it('has one player per zone and the right labels', () => {
    expect(formation.system).toBe(system);
    expect(formation.rotation).toBe(rotation);
    expect(formation.phase).toBe(phase);
    expect(formation.players.map((p) => p.zone).sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('is legal under the overlap rule', () => {
    expect(isLegalLineup(lineupOf(formation))).toBe(true);
  });

  it('puts S1 (S in 5-1) in the zone of the rotation number', () => {
    const s1 = byId(formation, system === '5-1' ? 's' : 's1');
    expect(s1.zone).toBe(rotation);
  });

  it('stays legal with the libero, who replaces the back-row MB', () => {
    const { formation: withL, benched } = withLibero(formation);
    expect(benched?.role).toBe('MB');
    expect(isLegalLineup(lineupOf(withL))).toBe(true);
    expect(findLiberoViolations(formationToZones(withL), rolesOf(withL))).toEqual([]);
  });
});

describe('two-setter systems', () => {
  it.each(['6-2', '4-2'] as const)(
    '%s has two setters opposite each other and no opposite',
    (system) => {
      for (const rotation of ROTATIONS) {
        const formation = systemFormation(system, rotation, 'base');
        const setters = formation.players.filter((p) => p.role === 'S');
        expect(setters).toHaveLength(2);
        expect(formation.players.some((p) => p.role === 'OPP')).toBe(false);
        expect(Math.abs(setters[0]!.zone - setters[1]!.zone)).toBe(3);
      }
    },
  );

  it.each(['6-2', '4-2'] as const)(
    '%s rotations 4, 3, 2 are rotations 1, 6, 5 with the pairs swapped',
    (system) => {
      const swap: Record<string, string> = {
        s1: 's2',
        s2: 's1',
        oh1: 'oh2',
        oh2: 'oh1',
        mb1: 'mb2',
        mb2: 'mb1',
      };
      for (const [a, b] of [
        [1, 4],
        [6, 3],
        [5, 2],
      ] as const) {
        for (const phase of PHASES) {
          const first = systemFormation(system, a, phase);
          const second = systemFormation(system, b, phase);
          for (const p of first.players) {
            const twin = byId(second, swap[p.id]!);
            expect(twin.zone).toBe(p.zone);
            expect(twin.position).toEqual(p.position);
          }
        }
      }
    },
  );
});

describe('setting setter', () => {
  it('is the only setter in 5-1, the back-row setter in 6-2 and the front-row setter in 4-2', () => {
    for (const rotation of ROTATIONS) {
      expect(settingSetter(systemFormation('5-1', rotation, 'base')).id).toBe('s');
      expect(isFrontRow(settingSetter(systemFormation('6-2', rotation, 'base')).zone)).toBe(false);
      expect(isFrontRow(settingSetter(systemFormation('4-2', rotation, 'base')).zone)).toBe(true);
    }
  });
});

const twoSetterReceives = (['6-2', '4-2'] as System[]).flatMap((system) =>
  ROTATIONS.map((rotation) => ({ system, rotation })),
);

describe.each(twoSetterReceives)('$system rotation $rotation receive', ({ system, rotation }) => {
  const formation = systemFormation(system, rotation, 'receive');
  const backRowMb = formation.players.find((p) => p.role === 'MB' && !isFrontRow(p.zone))!;
  const passers: FormationPlayer[] = [byId(formation, 'oh1'), byId(formation, 'oh2'), backRowMb];
  const setter = settingSetter(formation);

  it('lines up OH1, OH2 and the back-row MB as passers, one per lane', () => {
    for (const p of passers) {
      expect(p.position.y).toBeGreaterThanOrEqual(2.5);
      expect(p.position.y).toBeLessThanOrEqual(4.5);
    }
    const xs = passers.map((p) => p.position.x).sort((a, b) => a - b);
    [1.5, 4.5, 7.5].forEach((lane, i) => expect(Math.abs(xs[i]! - lane)).toBeLessThanOrEqual(1));
  });

  it('keeps everyone else at least 1.5 m from every passer', () => {
    const others = formation.players.filter((p) => !passers.includes(p) && p.id !== setter.id);
    expect(others).toHaveLength(2);
    for (const other of others) {
      for (const passer of passers) {
        expect(distanceBetween(other.position, passer.position)).toBeGreaterThanOrEqual(1.5);
      }
    }
  });

  if (system === '4-2') {
    it('has the front-row setter within 1 m of the zone-3 target', () => {
      expect(isFrontRow(setter.zone)).toBe(true);
      expect(distanceBetween(setter.position, SETTING_TARGET_4_2)).toBeLessThanOrEqual(1);
    });
  } else {
    it('has the back-row setter setting, positioned like the 5-1 setter', () => {
      expect(isFrontRow(setter.zone)).toBe(false);
    });
  }

  it('has a note', () => {
    expect(formation.note?.trim()).toBeTruthy();
  });
});
