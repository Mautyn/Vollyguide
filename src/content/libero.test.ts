import { describe, expect, it } from 'vitest';
import { findLiberoViolations } from '../domain/libero';
import { isLegalLineup } from '../domain/overlap';
import type { Point, Role, Rotation, ZoneMap } from '../domain/types';
import { isFrontRow } from '../domain/zones';
import { findFormation, type FormationPhase } from './catalog';
import { formationToZones, type Formation } from './formations';
import { LIBERO_REPLACEMENT_SPOT, withLibero } from './libero';

const cases = ([1, 2, 3, 4, 5, 6] as Rotation[]).flatMap((rotation) =>
  (['base', 'receive'] as FormationPhase[]).map((phase) => ({ rotation, phase })),
);

const lineupOf = (f: Formation) =>
  Object.fromEntries(f.players.map((p) => [p.zone, p.position])) as ZoneMap<Point>;

describe.each(cases)('withLibero, rotation $rotation $phase', ({ rotation, phase }) => {
  const original = findFormation('5-1', rotation, phase)!;
  const { formation, benched } = withLibero(original);
  const libero = formation.players.find((p) => p.role === 'L')!;
  const backRowMb = original.players.find((p) => p.role === 'MB' && !isFrontRow(p.zone))!;

  it('puts the libero on the back-row MB’s zone and spot, and benches that MB', () => {
    expect(libero.zone).toBe(backRowMb.zone);
    expect(libero.position).toEqual(backRowMb.position);
    expect(benched?.id).toBe(backRowMb.id);
    expect(benched?.position).toEqual(LIBERO_REPLACEMENT_SPOT);
    expect(formation.players.some((p) => p.id === backRowMb.id)).toBe(false);
    expect(formation.players).toHaveLength(6);
  });

  it('keeps everyone else where they were', () => {
    for (const player of original.players.filter((p) => p.id !== backRowMb.id)) {
      expect(formation.players).toContainEqual(player);
    }
  });

  it('is still legal: overlap rule and libero rules', () => {
    expect(isLegalLineup(lineupOf(formation))).toBe(true);
    const roles: Record<string, Role> = Object.fromEntries(
      formation.players.map((p) => [p.id, p.role]),
    );
    expect(findLiberoViolations(formationToZones(formation), roles)).toEqual([]);
  });

  if (phase === 'receive') {
    it('makes the libero one of the three passers', () => {
      expect(libero.position.y).toBeGreaterThanOrEqual(2.5);
      expect(libero.position.y).toBeLessThanOrEqual(4.5);
    });
  }
});
