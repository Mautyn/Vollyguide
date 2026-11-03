import { applyLibero, type RosterEntry } from './libero';
import { findOverlapViolations, type OverlapViolation } from './overlap';
import { rotateClockwise } from './rotation';
import { applyLiberoAtServe, SERVING_ZONE, withServerExempt } from './serve';
import type { Point, Rotation, System, ZoneMap } from './types';
import { ZONES } from './zones';

export type Side = 'us' | 'them';

export const otherSide = (side: Side): Side => (side === 'us' ? 'them' : 'us');

/** One team: its six rotating players, where they stand, and its libero (if any). */
export interface TeamState {
  system: System;
  /** The six players who rotate (never the libero). */
  players: readonly RosterEntry[];
  /** Which rotating player is in each zone. */
  zones: ZoneMap<string>;
  /** The player whose zone names the rotation: the setter (S1 with two setters). */
  rotationKey: string;
  libero: RosterEntry | null;
  /** USAV/NCAA: the middle blocker the libero serves for (#35). */
  liberoServesFor: string | null;
}

export interface MatchState {
  us: TeamState;
  them: TeamState;
  serving: Side;
  score: Record<Side, number>;
}

/** Who is actually on court for the next rally, with the libero applied. */
export interface CourtLineup {
  zones: ZoneMap<string>;
  /** The middle blocker the libero stands in for, or null. */
  liberoFor: string | null;
  /** The team has a libero, but it is off court for this rally (MB2 serving). */
  liberoWaiting: boolean;
}

export type MatchEvent =
  | { kind: 'point'; winner: Side; score: Record<Side, number> }
  | { kind: 'side-out'; team: Side; rotation: Rotation }
  | { kind: 'server'; team: Side; id: string }
  | { kind: 'libero-in'; team: Side; replaces: string }
  | { kind: 'libero-out'; team: Side; back: string };

export function newMatch(us: TeamState, them: TeamState, serving: Side): MatchState {
  for (const team of [us, them]) {
    const ids = new Set(team.players.map((p) => p.id));
    if (team.players.length !== 6 || ZONES.some((z) => !ids.has(team.zones[z]))) {
      throw new Error('A team needs six rotating players, one in every zone');
    }
  }
  return { us, them, serving, score: { us: 0, them: 0 } };
}

/** The rotation number: the zone the rotation key (setter, or S1) stands in. */
export function rotationNumber(team: TeamState): Rotation {
  const zone = ZONES.find((z) => team.zones[z] === team.rotationKey);
  if (zone === undefined) throw new Error(`${team.rotationKey} is not on court`);
  return zone;
}

/**
 * Who stands on court for the next rally. The libero replaces the back-row middle blocker;
 * when the team serves and that middle is in zone 1, the libero serves only for
 * `liberoServesFor` and otherwise waits off court while the middle serves.
 */
export function courtLineup(state: MatchState, side: Side): CourtLineup {
  const team = state[side];
  if (!team.libero) return { zones: { ...team.zones }, liberoFor: null, liberoWaiting: false };
  if (state.serving === side && team.liberoServesFor) {
    const result = applyLiberoAtServe(team.zones, team.players, team.libero, team.liberoServesFor);
    return { zones: result.zones, liberoFor: result.replaced, liberoWaiting: result.liberoOff };
  }
  const result = applyLibero(team.zones, team.players, team.libero);
  return {
    zones: result.zones,
    liberoFor: result.replaced,
    liberoWaiting: result.replaced === null,
  };
}

/** The player who serves the next rally. */
export function server(state: MatchState): string {
  return courtLineup(state, state.serving).zones[SERVING_ZONE];
}

/**
 * The next state after a rally, and what changed. Winning on your own serve keeps the
 * server; winning on the other team's serve (a side-out) rotates the winner clockwise and
 * its new zone-1 player serves. Libero changes happen only here, between rallies.
 */
export function playRally(
  state: MatchState,
  winner: Side,
): { state: MatchState; events: MatchEvent[] } {
  const score = { ...state.score, [winner]: state.score[winner] + 1 };
  const events: MatchEvent[] = [{ kind: 'point', winner, score }];
  let next: MatchState = { ...state, score };
  if (winner !== state.serving) {
    const team = next[winner];
    const rotated: TeamState = { ...team, zones: rotateClockwise(team.zones) };
    next = { ...next, [winner]: rotated, serving: winner };
    events.push({ kind: 'side-out', team: winner, rotation: rotationNumber(rotated) });
  }
  events.push({ kind: 'server', team: next.serving, id: server(next) });
  for (const side of ['us', 'them'] as const) {
    events.push(...liberoChanges(side, courtLineup(state, side), courtLineup(next, side)));
  }
  return { state: next, events };
}

function liberoChanges(side: Side, before: CourtLineup, after: CourtLineup): MatchEvent[] {
  if (before.liberoFor === after.liberoFor) return [];
  const events: MatchEvent[] = [];
  if (before.liberoFor !== null)
    events.push({ kind: 'libero-out', team: side, back: before.liberoFor });
  if (after.liberoFor !== null)
    events.push({ kind: 'libero-in', team: side, replaces: after.liberoFor });
  return events;
}

/**
 * Overlap faults at the serve for one team's lineup (positions by zone). The serving team's
 * server is exempt: `serverStandIn` (the zone-1 base spot) replaces where they stand.
 */
export function serveViolations(
  lineup: ZoneMap<Point>,
  serving: boolean,
  serverStandIn: Point,
): OverlapViolation[] {
  return findOverlapViolations(serving ? withServerExempt(lineup, serverStandIn) : lineup);
}
