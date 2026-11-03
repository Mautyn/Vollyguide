import { describe, expect, it } from 'vitest';
import { findLiberoViolations, type RosterEntry } from './libero';
import {
  courtLineup,
  newMatch,
  playRally,
  rotationNumber,
  server,
  serveViolations,
  type MatchState,
  type Side,
  type TeamState,
} from './match';
import type { Point, Role, System, ZoneMap } from './types';
import { ZONES } from './zones';

const BASE: ZoneMap<Point> = {
  4: { x: 1.5, y: 7.5 },
  3: { x: 4.5, y: 7.5 },
  2: { x: 7.5, y: 7.5 },
  5: { x: 1.5, y: 3 },
  6: { x: 4.5, y: 3 },
  1: { x: 7.5, y: 3 },
};
const SERVER_SPOT: Point = { x: 7.5, y: -1 };

/** Rotation-1 lineups (setter or S1 in zone 1), as in src/content. */
const LINEUPS: Record<System, ZoneMap<[string, Role]>> = {
  '5-1': {
    1: ['s', 'S'],
    2: ['oh1', 'OH'],
    3: ['mb2', 'MB'],
    4: ['opp', 'OPP'],
    5: ['oh2', 'OH'],
    6: ['mb1', 'MB'],
  },
  '6-2': {
    1: ['s1', 'S'],
    2: ['oh1', 'OH'],
    3: ['mb2', 'MB'],
    4: ['s2', 'S'],
    5: ['oh2', 'OH'],
    6: ['mb1', 'MB'],
  },
  '4-2': {
    1: ['s1', 'S'],
    2: ['oh1', 'OH'],
    3: ['mb2', 'MB'],
    4: ['s2', 'S'],
    5: ['oh2', 'OH'],
    6: ['mb1', 'MB'],
  },
}; // fmt: skip

function team(system: System, libero: boolean, prefix = ''): TeamState {
  const lineup = LINEUPS[system];
  const players: RosterEntry[] = ZONES.map((z) => ({
    id: prefix + lineup[z][0],
    role: lineup[z][1],
  }));
  const zones = Object.fromEntries(ZONES.map((z) => [z, prefix + lineup[z][0]])) as ZoneMap<string>;
  return {
    system,
    players,
    zones,
    rotationKey: prefix + (system === '5-1' ? 's' : 's1'),
    libero: libero ? { id: `${prefix}l`, role: 'L' } : null,
    liberoServesFor: libero ? `${prefix}mb1` : null,
  };
}

const match = (system: System, libero: boolean, serving: Side = 'them') =>
  newMatch(team(system, libero), team('5-1', false, 'them-'), serving);

/** Plays results in order and returns every state, starting with `start`. */
function play(start: MatchState, winners: Side[]): MatchState[] {
  const states = [start];
  for (const w of winners) states.push(playRally(states.at(-1)!, w).state);
  return states;
}

const SYSTEMS: readonly System[] = ['5-1', '6-2', '4-2'];

describe.each(SYSTEMS)('%s', (system) => {
  it('goes through all six rotations in order and back after six side-outs', () => {
    // They serve first; we side-out, then lose the serve, six times over.
    const winners: Side[] = Array.from({ length: 6 }, () => ['us', 'them'] as Side[]).flat();
    const states = play(match(system, true), winners);
    const ourRotations = states.filter((_, i) => i % 2 === 1).map((s) => rotationNumber(s.us));
    expect(ourRotations).toEqual([6, 5, 4, 3, 2, 1]);
    expect(states.at(-1)!.us.zones).toEqual(states[0]!.us.zones);
  });

  it('never rotates or changes server while we keep winning our serve', () => {
    const states = play(match(system, true, 'us'), ['us', 'us', 'us']);
    for (const s of states) {
      expect(s.us.zones).toEqual(states[0]!.us.zones);
      expect(server(s)).toBe(server(states[0]!));
    }
    expect(states.at(-1)!.score).toEqual({ us: 3, them: 0 });
  });

  it('keeps every serve legal and the libero out of the front row, in every rotation', () => {
    // Every rotation, both serving and receiving, libero on and off.
    for (const libero of [true, false]) {
      const winners: Side[] = Array.from({ length: 6 }, () => ['us', 'them'] as Side[]).flat();
      for (const state of play(match(system, libero), winners)) {
        for (const side of ['us', 'them'] as const) {
          const { zones } = courtLineup(state, side);
          const serving = state.serving === side;
          const lineup = Object.fromEntries(
            ZONES.map((z) => [z, serving && z === 1 ? SERVER_SPOT : BASE[z]]),
          ) as ZoneMap<Point>;
          expect(serveViolations(lineup, serving, BASE[1])).toEqual([]);
          const roles = Object.fromEntries(
            [...state[side].players, ...(state[side].libero ? [state[side].libero!] : [])].map(
              (p) => [p.id, p.role],
            ),
          );
          expect(findLiberoViolations(zones, roles)).toEqual([]);
          expect(new Set(ZONES.map((z) => zones[z])).size).toBe(6);
        }
      }
    }
  });

  it('lets the libero serve only in MB1’s turn; MB2 serves its own', () => {
    const servers: string[] = [];
    // Win the serve back every time and then lose it at once: we serve in every rotation.
    let state = match(system, true);
    for (let i = 0; i < 6; i++) {
      state = playRally(state, 'us').state;
      servers.push(server(state));
      state = playRally(state, 'them').state;
    }
    expect(servers.filter((id) => id === 'l')).toHaveLength(1);
    expect(servers).toContain('mb2');
    expect(servers).not.toContain('mb1');
  });
});

describe('libero changes between rallies', () => {
  it('reports the libero going out and in, and replaces MB2 after we lose its serve', () => {
    // 5-1, they serve. Side-outs move MB2 from zone 3 to 2 and then to 1.
    let state = match('5-1', true);
    expect(courtLineup(state, 'us').liberoFor).toBe('mb1'); // MB1 in zone 6
    state = playRally(state, 'us').state; // rotation 6: MB1 in 5, MB2 in 2
    state = playRally(state, 'them').state;
    const { state: serving, events } = playRally(state, 'us'); // rotation 5: MB2 in 1, MB1 in 4
    expect(server(serving)).toBe('mb2');
    expect(courtLineup(serving, 'us')).toMatchObject({ liberoFor: null, liberoWaiting: true });
    expect(events).toContainEqual({ kind: 'libero-out', team: 'us', back: 'mb1' });
    expect(events).not.toContainEqual(expect.objectContaining({ kind: 'libero-in' }));

    const lost = playRally(serving, 'them');
    expect(courtLineup(lost.state, 'us').liberoFor).toBe('mb2');
    expect(lost.events).toContainEqual({ kind: 'libero-in', team: 'us', replaces: 'mb2' });
  });

  it('never gives the opponent a libero', () => {
    const state = match('5-1', true);
    expect(courtLineup(state, 'them')).toEqual({
      zones: state.them.zones,
      liberoFor: null,
      liberoWaiting: false,
    });
  });
});

describe('score, serve and events', () => {
  it('follows a scripted sequence', () => {
    const start = match('5-1', false, 'them');
    expect(server(start)).toBe('them-s');
    const a = playRally(start, 'them'); // they hold serve
    expect(a.events).toEqual([
      { kind: 'point', winner: 'them', score: { us: 0, them: 1 } },
      { kind: 'server', team: 'them', id: 'them-s' },
    ]);
    const b = playRally(a.state, 'us'); // side-out: we rotate, OH1 (from zone 2) serves
    expect(b.events).toEqual([
      { kind: 'point', winner: 'us', score: { us: 1, them: 1 } },
      { kind: 'side-out', team: 'us', rotation: 6 },
      { kind: 'server', team: 'us', id: 'oh1' },
    ]);
    const c = playRally(b.state, 'them'); // they side-out and rotate too
    expect(c.events).toContainEqual({ kind: 'side-out', team: 'them', rotation: 6 });
    expect(server(c.state)).toBe('them-oh1');
    expect(c.state.score).toEqual({ us: 1, them: 2 });
    expect(rotationNumber(c.state.us)).toBe(6);
  });

  it('rejects a team without a player in every zone', () => {
    const broken = { ...team('5-1', false), zones: { ...team('5-1', false).zones, 3: 'nobody' } };
    expect(() => newMatch(broken, team('5-1', false, 'them-'), 'us')).toThrow(/six/);
  });

  it('finds overlap faults, but not for the server', () => {
    const swapped = { ...BASE, 5: { x: 5, y: 3 } };
    expect(serveViolations(swapped, false, BASE[1])).not.toEqual([]);
    const serverLeft = { ...BASE, 1: { x: 0.5, y: -1 } };
    expect(serveViolations(serverLeft, true, BASE[1])).toEqual([]);
    expect(serveViolations(serverLeft, false, BASE[1])).not.toEqual([]);
  });
});
