import { describe, expect, it } from 'vitest';
import { isLegalLineup } from '../domain/overlap';
import type { Point, Rotation, ZoneMap } from '../domain/types';
import { isFrontRow } from '../domain/zones';
import type { Formation, FormationPlayer } from './formations';
import { RECEIVE_5_1_ROTATIONS } from './receive';
import { BASE_5_1_ROTATIONS } from './rotations';

const ALL: Rotation[] = [1, 2, 3, 4, 5, 6];

const lineupOf = (f: Formation) =>
  Object.fromEntries(f.players.map((p) => [p.zone, p.position])) as ZoneMap<Point>;

const byId = (f: Formation, id: string) => f.players.find((p) => p.id === id)!;

function passersOf(f: Formation): FormationPlayer[] {
  const backRowMb = f.players.find((p) => p.role === 'MB' && !isFrontRow(p.zone))!;
  return [byId(f, 'oh1'), byId(f, 'oh2'), backRowMb];
}

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

describe.each(ALL)('5-1 serve receive, rotation %i', (rotation) => {
  const formation = RECEIVE_5_1_ROTATIONS[rotation];

  it('is a legal lineup at the moment of serve', () => {
    expect(isLegalLineup(lineupOf(formation))).toBe(true);
  });

  it('keeps every player in the same zone as the base rotation', () => {
    const base = BASE_5_1_ROTATIONS[rotation];
    expect(formation.players.map((p) => [p.id, p.zone])).toEqual(
      base.players.map((p) => [p.id, p.zone]),
    );
    expect(formation.phase).toBe('receive');
    expect(formation.note).toBeTruthy();
  });

  it('has exactly one middle blocker in the back row', () => {
    const backRowMbs = formation.players.filter((p) => p.role === 'MB' && !isFrontRow(p.zone));
    expect(backRowMbs).toHaveLength(1);
  });

  it('lines up OH1, OH2 and the back-row MB as passers between 2.5 and 4.5 m', () => {
    const passers = passersOf(formation);
    for (const p of passers) {
      expect(p.position.y).toBeGreaterThanOrEqual(2.5);
      expect(p.position.y).toBeLessThanOrEqual(4.5);
    }
    const xs = passers.map((p) => p.position.x).sort((a, b) => a - b);
    [1.5, 4.5, 7.5].forEach((lane, i) => expect(Math.abs(xs[i]! - lane)).toBeLessThanOrEqual(1));
  });

  it('keeps the opposite and the front-row MB out of the passing lanes', () => {
    const passers = passersOf(formation);
    const frontRowMb = formation.players.find((p) => p.role === 'MB' && isFrontRow(p.zone))!;
    for (const other of [byId(formation, 'opp'), frontRowMb]) {
      for (const passer of passers) {
        expect(distance(other.position, passer.position)).toBeGreaterThanOrEqual(1.5);
      }
    }
  });
});

describe('setter position in serve receive', () => {
  it('is at the net in every rotation except 1, where the overlap rule keeps it back', () => {
    for (const rotation of ALL) {
      const setter = byId(RECEIVE_5_1_ROTATIONS[rotation], 's');
      if (rotation === 1) expect(setter.position.y).toBeLessThan(4.5);
      else expect(setter.position.y).toBeGreaterThanOrEqual(8);
    }
  });
});
