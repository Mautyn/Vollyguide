import { describe, expect, it } from 'vitest';
import { isLegalLineup } from './overlap';
import { rotateClockwise } from './rotation';
import { applyLiberoAtServe, serverId, switchZones, withServerExempt } from './serve';
import type { Point, Role, System, Zone, ZoneMap } from './types';
import { isFrontRow, ZONES } from './zones';

/** Rotation 1 rosters (setter or S1 in zone 1), as role + id per zone. */
const FIVE_ONE: ZoneMap<[string, Role]> = {
  1: ['s', 'S'],
  2: ['oh1', 'OH'],
  3: ['mb2', 'MB'],
  4: ['opp', 'OPP'],
  5: ['oh2', 'OH'],
  6: ['mb1', 'MB'],
};
const TWO_SETTERS: ZoneMap<[string, Role]> = {
  1: ['s1', 'S'],
  2: ['oh1', 'OH'],
  3: ['mb2', 'MB'],
  4: ['s2', 'S'],
  5: ['oh2', 'OH'],
  6: ['mb1', 'MB'],
};
const ROSTER: Record<System, ZoneMap<[string, Role]>> = {
  '5-1': FIVE_ONE,
  '6-2': TWO_SETTERS,
  '4-2': TWO_SETTERS,
};

/** All six rotations in playing order, optionally with the libero for the back-row MB. */
function rotations(system: System, libero: boolean): ZoneMap<[string, Role]>[] {
  const result: ZoneMap<[string, Role]>[] = [];
  let lineup = ROSTER[system];
  for (let i = 0; i < 6; i++) {
    if (libero) {
      const roster = ZONES.map((z) => ({ id: lineup[z][0], role: lineup[z][1] }));
      const { zones } = applyLiberoAtServe(ids(lineup), roster, LIBERO, 'mb1');
      const roleOf = new Map([...roster, LIBERO].map((p) => [p.id, p.role]));
      result.push(
        Object.fromEntries(ZONES.map((z) => [z, [zones[z], roleOf.get(zones[z])!]])) as ZoneMap<
          [string, Role]
        >,
      );
    } else {
      result.push({ ...lineup });
    }
    lineup = rotateClockwise(lineup);
  }
  return result;
}

const ids = (lineup: ZoneMap<[string, Role]>) =>
  Object.fromEntries(ZONES.map((z) => [z, lineup[z][0]])) as ZoneMap<string>;
const roles = (lineup: ZoneMap<[string, Role]>) =>
  Object.fromEntries(ZONES.map((z) => [z, lineup[z][1]])) as ZoneMap<Role>;

const LIBERO = { id: 'l', role: 'L' as Role };

const SYSTEMS: readonly System[] = ['5-1', '6-2', '4-2'];
const CASES = SYSTEMS.flatMap((system) =>
  [false, true].flatMap((libero) =>
    rotations(system, libero).map((lineup, i) => ({ system, libero, step: i, lineup })),
  ),
);

describe('serverId', () => {
  it('is the player in zone 1', () => {
    expect(serverId(ids(FIVE_ONE))).toBe('s');
  });

  it.each(SYSTEMS)(
    '%s: with the libero on, the libero serves exactly once in six rotations',
    (system) => {
      const servers = rotations(system, true).map((lineup) => serverId(ids(lineup)));
      expect(servers.filter((id) => id === 'l')).toHaveLength(1);
      // The libero serves for MB1; MB2 serves its own turn; MB1 never serves.
      expect(servers).toContain('mb2');
      expect(servers).not.toContain('mb1');
    },
  );

  it.each(SYSTEMS)(
    '%s: with the libero off, each player serves once in six rotations',
    (system) => {
      const servers = rotations(system, false).map((lineup) => serverId(ids(lineup)));
      expect(new Set(servers).size).toBe(6);
    },
  );
});

describe('applyLiberoAtServe', () => {
  const roster = ZONES.map((z) => ({ id: FIVE_ONE[z][0], role: FIVE_ONE[z][1] }));

  it('replaces the back-row MB as usual when it is not serving', () => {
    // Rotation 1: MB1 in zone 6.
    const result = applyLiberoAtServe(ids(FIVE_ONE), roster, LIBERO, 'mb1');
    expect(result).toMatchObject({ replaced: 'mb1', liberoOff: false });
    expect(result.zones[6]).toBe('l');
  });

  it('serves for the chosen MB in zone 1', () => {
    const zones = { ...ids(FIVE_ONE), 1: 'mb1', 6: 's' };
    const result = applyLiberoAtServe(zones, roster, LIBERO, 'mb1');
    expect(result).toMatchObject({ replaced: 'mb1', liberoOff: false });
    expect(serverId(result.zones)).toBe('l');
  });

  it('stays off court when the other MB is in zone 1', () => {
    const zones = { ...ids(FIVE_ONE), 1: 'mb2', 3: 's' };
    const result = applyLiberoAtServe(zones, roster, LIBERO, 'mb1');
    expect(result).toEqual({ zones, replaced: null, liberoOff: true });
    expect(serverId(result.zones)).toBe('mb2');
  });
});

describe('withServerExempt', () => {
  const base: ZoneMap<Point> = {
    4: { x: 1.5, y: 7.5 },
    3: { x: 4.5, y: 7.5 },
    2: { x: 7.5, y: 7.5 },
    5: { x: 1.5, y: 3 },
    6: { x: 4.5, y: 3 },
    1: { x: 7.5, y: 3 },
  };

  it('ignores where the server stands behind the end line', () => {
    const serverLeft = { ...base, 1: { x: 1, y: -1 } };
    expect(isLegalLineup(serverLeft)).toBe(false);
    expect(isLegalLineup(withServerExempt(serverLeft, base[1]))).toBe(true);
  });

  it('still checks everyone else', () => {
    const swapped = { ...base, 5: { x: 5, y: 3 } };
    expect(isLegalLineup(withServerExempt(swapped, base[1]))).toBe(false);
  });
});

describe('switchZones', () => {
  it.each(CASES.map((c) => [c.system, c.libero ? 'libero' : 'no libero', c.step + 1, c] as const))(
    '%s, %s, rotation step %i: one spot each, rows kept',
    (_s, _l, _i, { system, lineup }) => {
      const targets = switchZones(system, roles(lineup));
      expect(new Set(ZONES.map((z) => targets[z])).size).toBe(6);
      for (const zone of ZONES) expect(isFrontRow(targets[zone])).toBe(isFrontRow(zone));
    },
  );

  it.each(CASES.map((c) => [c.system, c.libero ? 'libero' : 'no libero', c.step + 1, c] as const))(
    '%s, %s, rotation step %i: roles end where the system wants them',
    (_s, _l, _i, { system, lineup }) => {
      const r = roles(lineup);
      const targets = switchZones(system, r);
      const roleAt = (target: Zone) => r[ZONES.find((z) => targets[z] === target)!];
      // Back row (perimeter defense).
      expect(['L', 'MB']).toContain(roleAt(5));
      expect(roleAt(6)).toBe('OH');
      expect(['S', 'OPP']).toContain(roleAt(1));
      // Front row.
      expect(roleAt(4)).toBe('OH');
      if (system === '4-2') {
        expect(roleAt(3)).toBe('S');
        expect(roleAt(2)).toBe('MB');
      } else {
        expect(roleAt(3)).toBe('MB');
        expect(['S', 'OPP']).toContain(roleAt(2));
      }
    },
  );

  it('moves the 5-1 rotation 1 front row: OPP from 4 to right, OH1 from 2 to left', () => {
    const targets = switchZones('5-1', roles(FIVE_ONE));
    expect(targets).toEqual({ 4: 2, 3: 3, 2: 4, 5: 6, 6: 5, 1: 1 });
  });

  it('rejects a lineup with two players for one spot', () => {
    const twoOppositesInFront = { ...roles(FIVE_ONE), 3: 'OPP' as Role };
    expect(() => switchZones('5-1', twoOppositesInFront)).toThrow(/switch spot/);
  });
});
