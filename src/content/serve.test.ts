import { describe, expect, it } from 'vitest';
import { findLiberoViolations } from '../domain/libero';
import { isLegalLineup } from '../domain/overlap';
import { serverId, SERVING_ZONE, withServerExempt } from '../domain/serve';
import type { Point, Role, Rotation, ZoneMap } from '../domain/types';
import { isFrontRow, ZONES } from '../domain/zones';
import { findFormation } from './catalog';
import { BASE_SPOTS, formationToZones, type Formation } from './formations';
import { LIBERO_REPLACEMENT_SPOT, withLibero } from './libero';
import { DEFENSE_SPOTS, defensePositions, LIBERO_SERVES_FOR, SERVER_SPOT } from './serve';
import { SYSTEMS } from './systems';

const ROTATIONS: readonly Rotation[] = [1, 2, 3, 4, 5, 6];

const lineupOf = (f: Formation) =>
  Object.fromEntries(f.players.map((p) => [p.zone, p.position])) as ZoneMap<Point>;

const cases = SYSTEMS.flatMap((system) =>
  ROTATIONS.flatMap((rotation) =>
    [false, true].map((libero) => {
      const serve = findFormation(system, rotation, 'serve')!;
      const { formation, benched } = libero
        ? withLibero(serve)
        : { formation: serve, benched: null };
      return { system, rotation, libero, serve, formation, benched };
    }),
  ),
);

describe.each(cases)(
  '$system rotation $rotation serve, libero $libero',
  ({ system, rotation, serve, formation }) => {
    it('exists with an id, the serve phase and a note', () => {
      expect(serve.id).toBe(`${system}-r${rotation}-serve`);
      expect(serve.phase).toBe('serve');
      expect(serve.note?.trim()).toBeTruthy();
    });

    it('has the server behind the end line and everyone else on their base spot', () => {
      for (const player of formation.players) {
        expect(player.position).toEqual(
          player.zone === SERVING_ZONE ? SERVER_SPOT : BASE_SPOTS[player.zone],
        );
      }
      expect(SERVER_SPOT.y).toBeLessThan(0);
    });

    it('is overlap-legal with the server exempt, and follows the libero rules', () => {
      expect(isLegalLineup(withServerExempt(lineupOf(formation), BASE_SPOTS[1]))).toBe(true);
      const roles = Object.fromEntries(formation.players.map((p) => [p.id, p.role])) as Record<
        string,
        Role
      >;
      expect(findLiberoViolations(formationToZones(formation), roles)).toEqual([]);
    });

    it('sends every player to a different defensive spot in their own row', () => {
      const defense = defensePositions(formation);
      const spots = formation.players.map((p) => defense[p.id]!);
      expect(new Set(spots.map((p) => `${p.x},${p.y}`)).size).toBe(6);
      for (const player of formation.players) {
        const target = ZONES.find(
          (z) =>
            DEFENSE_SPOTS[z].x === defense[player.id]!.x &&
            DEFENSE_SPOTS[z].y === defense[player.id]!.y,
        )!;
        expect(isFrontRow(target)).toBe(isFrontRow(player.zone));
      }
    });
  },
);

describe.each(SYSTEMS)('%s serve with the libero on', (system) => {
  const withL = cases.filter((c) => c.system === system && c.libero);
  const servers = withL.map((c) => serverId(formationToZones(c.formation)));

  it('lets the libero serve in exactly one rotation, the one where MB1 is in zone 1', () => {
    const liberoServes = withL.filter((c) => serverId(formationToZones(c.formation)) === 'l');
    expect(liberoServes).toHaveLength(1);
    expect(formationToZones(liberoServes[0]!.serve)[SERVING_ZONE]).toBe(LIBERO_SERVES_FOR);
  });

  it('lets MB2 serve its own turn while the libero waits on the bench', () => {
    const mb2Serves = withL.find((c) => serverId(formationToZones(c.formation)) === 'mb2')!;
    expect(mb2Serves.formation.players.some((p) => p.role === 'L')).toBe(false);
    expect(mb2Serves.benched).toMatchObject({
      id: 'l',
      role: 'L',
      position: LIBERO_REPLACEMENT_SPOT,
    });
  });

  it('never has MB1 serve', () => {
    expect(servers).not.toContain('mb1');
  });
});

describe('switch examples', () => {
  it('5-1 rotation 1: moves the opposite to the right, OH1 to the left, and the setter stays right back', () => {
    const defense = defensePositions(findFormation('5-1', 1, 'serve')!);
    expect(defense.opp).toEqual(DEFENSE_SPOTS[2]);
    expect(defense.oh1).toEqual(DEFENSE_SPOTS[4]);
    expect(defense.mb2).toEqual(DEFENSE_SPOTS[3]);
    expect(defense.s).toEqual(DEFENSE_SPOTS[1]);
    expect(defense.mb1).toEqual(DEFENSE_SPOTS[5]);
    expect(defense.oh2).toEqual(DEFENSE_SPOTS[6]);
  });

  it('4-2 rotation 1: the front-row setter switches to the middle, the MB to the right', () => {
    const defense = defensePositions(findFormation('4-2', 1, 'serve')!);
    // Front row at the serve: S2 in 4, MB2 in 3, OH1 in 2.
    expect(defense.s2).toEqual(DEFENSE_SPOTS[3]);
    expect(defense.mb2).toEqual(DEFENSE_SPOTS[2]);
    expect(defense.oh1).toEqual(DEFENSE_SPOTS[4]);
  });
});
