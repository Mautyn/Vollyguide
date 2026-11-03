import { distanceBetween } from '../../domain/grading';
import { SERVING_ZONE, switchZones } from '../../domain/serve';
import { toOpponentFrame } from '../../domain/opponent';
import type { Point, Role, Rotation, System, Zone, ZoneMap } from '../../domain/types';
import { isFrontRow, ZONES } from '../../domain/zones';
import { findFormation } from '../catalog';
import { DEFENSE_SPOTS, SERVER_SPOT } from '../serve';
import { SETTING_TARGET_4_2 } from '../systems';
import {
  VS_LEFT_SIDE_AT_CONTACT,
  VS_MIDDLE_AT_CONTACT,
  VS_RIGHT_SIDE_AT_CONTACT,
} from '../tactics/defense';

/*
 * Where every player stands in each phase of a rally (#48, #50). Positions are in meters
 * in the team's own frame (y = 0 at its end line, net at y = 9); `mirrorToOpponent` turns
 * the opponent's positions into the shared frame.
 *
 * During a rally players stand by "spot", not by name: after the serve everyone switches to
 * a spot (switchZones, #35), so the same rules work for 5-1, 6-2 and 4-2. Spots are named by
 * the zone they are in: 4/3/2 left/middle/right front, 5/6/1 left/middle/right back.
 */

export type AttackOption = 'outside' | 'middle' | 'right' | 'pipe';

/** Where the attacking team hits from, seen by the attacking team itself. */
export type AttackSide = 'left' | 'middle' | 'right';

export type RallyPhase =
  | { kind: 'serve' }
  | { kind: 'switch' }
  | { kind: 'receive' }
  | { kind: 'set' }
  | { kind: 'attack'; option: AttackOption }
  | { kind: 'block'; from: AttackSide }
  | { kind: 'transition' }
  | { kind: 'free-ball' }
  | { kind: 'down-ball' };

/** One team on court for a rally, as the rally engine (src/domain/match.ts) gives it. */
export interface TeamOnCourt {
  system: System;
  rotation: Rotation;
  /** Who stands in each zone at the serve (libero applied). */
  zones: ZoneMap<string>;
  roles: Readonly<Record<string, Role>>;
  serving: boolean;
}

export type Positions = Record<string, Point>;

/** The setting spot: right of centre for 5-1 and 6-2, zone 3 for the 4-2 front-row setter. */
export const SETTING_SPOT: Point = { x: 5.8, y: 8.5 };

export function settingSpot(system: System): Point {
  return system === '4-2' ? SETTING_TARGET_4_2 : SETTING_SPOT;
}

/** Where attackers start their approach (set and transition). */
const APPROACH: Readonly<Record<'left' | 'middle' | 'right' | 'pipe', Point>> = {
  left: { x: 0.8, y: 5.8 },
  middle: { x: 4.2, y: 6.4 },
  right: { x: 8.3, y: 5.8 },
  pipe: { x: 4.5, y: 2.8 },
};

/** Back-row spots while the team sets up an attack (slot 6 is the pipe hitter). */
const BACK_WHILE_ATTACKING: Readonly<Record<5 | 1, Point>> = {
  5: { x: 1.5, y: 3.5 },
  1: { x: 7.5, y: 3.5 },
};

/** Where the attacker contacts the ball. */
export const CONTACT: Readonly<Record<AttackOption, Point>> = {
  outside: { x: 1.2, y: 8.3 },
  middle: { x: 4.6, y: 8.4 },
  right: { x: 7.8, y: 8.3 },
  pipe: { x: 4.5, y: 6.2 },
};

/** The Defense tab's contact positions, written per player of its 5-1, read by spot. */
const DEFENSE_KEY_TO_SPOT: Readonly<Record<string, Zone>> = {
  oh1: 4,
  mb: 3,
  opp: 2,
  oh2: 5,
  l: 6,
  s: 1,
};

function bySpot(positions: Readonly<Record<string, Point>>): ZoneMap<Point> {
  return Object.fromEntries(
    Object.entries(positions).map(([key, p]) => [DEFENSE_KEY_TO_SPOT[key], { ...p }]),
  ) as ZoneMap<Point>;
}

/** Block and perimeter defense at the attacker's contact, by spot (Defense tab, #21). */
export const BLOCK_DEFENSE: Readonly<Record<AttackSide, ZoneMap<Point>>> = {
  // An attack from the opponent's left side comes at our right side.
  left: bySpot(VS_LEFT_SIDE_AT_CONTACT),
  right: bySpot(VS_RIGHT_SIDE_AT_CONTACT),
  middle: bySpot(VS_MIDDLE_AT_CONTACT),
};

/** Spots that jump to block against each side. */
export const BLOCKING_SPOTS: Readonly<Record<AttackSide, readonly Zone[]>> = {
  left: [2, 3],
  right: [4, 3],
  middle: [3],
};

/** The spot each player switches to once the ball is in play. */
export function spotsOf(team: TeamOnCourt): Record<string, Zone> {
  const roles = Object.fromEntries(
    ZONES.map((z) => [z, team.roles[team.zones[z]]!]),
  ) as ZoneMap<Role>;
  const targets = switchZones(team.system, roles);
  return Object.fromEntries(ZONES.map((z) => [team.zones[z], targets[z]]));
}

/** The player at each spot. */
export function playerAtSpot(team: TeamOnCourt): ZoneMap<string> {
  const spots = spotsOf(team);
  return Object.fromEntries(
    Object.entries(spots).map(([id, spot]) => [spot, id]),
  ) as ZoneMap<string>;
}

/** The setter who sets: the only one in 5-1, the back-row one in 6-2, the front-row one in 4-2. */
export function settingSetterId(team: TeamOnCourt): string {
  const setters = ZONES.filter((z) => team.roles[team.zones[z]] === 'S');
  if (setters.length === 1) return team.zones[setters[0]!];
  const wantFront = team.system === '4-2';
  const zone = setters.find((z) => isFrontRow(z) === wantFront);
  if (zone === undefined) throw new Error('No setting setter on court');
  return team.zones[zone];
}

/** The attacks this rotation offers: no one attacks from a spot the setter or libero holds. */
export function availableAttacks(team: TeamOnCourt): AttackOption[] {
  const at = playerAtSpot(team);
  const setter = settingSetterId(team);
  const can = (spot: Zone) => at[spot] !== setter && team.roles[at[spot]] !== 'L';
  const options: AttackOption[] = [];
  if (can(4)) options.push('outside');
  if (can(3)) options.push('middle');
  if (can(2)) options.push('right');
  if (can(6)) options.push('pipe');
  return options;
}

/** The player who attacks with this option. */
export function attackerId(team: TeamOnCourt, option: AttackOption): string {
  if (!availableAttacks(team).includes(option)) {
    throw new Error(`${option} is not an attack option in this rotation`);
  }
  const spot: Zone = { outside: 4, middle: 3, right: 2, pipe: 6 }[option] as Zone;
  return playerAtSpot(team)[spot];
}

function byZone(team: TeamOnCourt, spots: ZoneMap<Point>): Positions {
  return Object.fromEntries(ZONES.map((z) => [team.zones[z], { ...spots[z] }]));
}

function bySpotOf(team: TeamOnCourt, spots: ZoneMap<Point>): Positions {
  const at = playerAtSpot(team);
  return Object.fromEntries(ZONES.map((z) => [at[z], { ...spots[z] }]));
}

function formationByZone(team: TeamOnCourt, phase: 'serve' | 'receive'): Positions {
  const formation = findFormation(team.system, team.rotation, phase)!;
  const spots = Object.fromEntries(
    formation.players.map((p) => [p.zone, p.position]),
  ) as ZoneMap<Point>;
  return byZone(team, spots);
}

/** Setting an attack (after the pass or a dig): setter to the spot, attackers to approach. */
function attackSetup(team: TeamOnCourt): Positions {
  const setter = settingSetterId(team);
  const spots: ZoneMap<Point> = {
    4: APPROACH.left,
    3: APPROACH.middle,
    2: APPROACH.right,
    5: BACK_WHILE_ATTACKING[5],
    6: APPROACH.pipe,
    1: BACK_WHILE_ATTACKING[1],
  };
  const positions = bySpotOf(team, spots);
  // The setter leaves its own spot for the setting spot; nobody else needs to move.
  positions[setter] = { ...settingSpot(team.system) };
  return positions;
}

/** 2-3 coverage around the attacker: the setter and one more close, three in a deep line. */
function coverage(team: TeamOnCourt, option: AttackOption, from: Positions): Positions {
  const attacker = attackerId(team, option);
  const contact = CONTACT[option];
  const pipe = option === 'pipe';
  const round = (v: number) => Math.round(v * 10) / 10;
  const clampX = (x: number) => round(Math.min(8.7, Math.max(0.3, x)));
  const close: Point[] = pipe
    ? [
        { x: clampX(contact.x + 1.4), y: round(contact.y + 1.1) },
        { x: clampX(contact.x - 1.4), y: round(contact.y + 1.1) },
      ]
    : [
        { x: clampX(contact.x + 1.3), y: round(contact.y - 1) },
        { x: clampX(contact.x - 1.3), y: round(contact.y - 0.9) },
      ];
  const deepY = pipe ? 3.4 : 4.4;
  const deep: Point[] = [1.6, 4.5, 7.4].map((x) => ({ x, y: deepY }));

  const setter = settingSetterId(team);
  const others = Object.keys(from).filter((id) => id !== attacker && id !== setter);
  const positions: Positions = { [attacker]: { ...contact } };

  // The setter takes the nearer close spot; the nearest other player takes the second.
  const [setterSpot, otherSpot] =
    distanceBetween(from[setter]!, close[0]!) <= distanceBetween(from[setter]!, close[1]!)
      ? [close[0]!, close[1]!]
      : [close[1]!, close[0]!];
  positions[setter] = { ...setterSpot };
  const second = others.reduce((best, id) =>
    distanceBetween(from[id]!, otherSpot) < distanceBetween(from[best]!, otherSpot) ? id : best,
  );
  positions[second] = { ...otherSpot };

  // The other three fill the deep line, choosing the order with the least running.
  const rest = others.filter((id) => id !== second);
  let best: string[] = rest;
  let bestCost = Infinity;
  for (const order of permutations(rest)) {
    const cost = order.reduce((sum, id, i) => sum + distanceBetween(from[id]!, deep[i]!), 0);
    if (cost < bestCost) [best, bestCost] = [order, cost];
  }
  best.forEach((id, i) => (positions[id] = { ...deep[i]! }));
  return positions;
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [items.slice()];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

const FREE_BALL_FRONT: Readonly<Record<4 | 3 | 2, Point>> = {
  4: { x: 1.2, y: 6 },
  3: { x: 4.5, y: 6.2 },
  2: { x: 7.8, y: 6 },
};

/** Free ball: the front row drops to the attack line, the setter releases, the rest pass. */
function freeBall(team: TeamOnCourt): Positions {
  const at = playerAtSpot(team);
  const setter = settingSetterId(team);
  const positions: Positions = {};
  for (const spot of [4, 3, 2] as const) {
    if (at[spot] !== setter) positions[at[spot]] = { ...FREE_BALL_FRONT[spot] };
  }
  const passers = ([5, 6, 1] as const).map((z) => at[z]).filter((id) => id !== setter);
  const lanes: Point[] =
    passers.length === 3
      ? [
          { x: 1.5, y: 3.2 },
          { x: 4.5, y: 2.6 },
          { x: 7.5, y: 3.2 },
        ]
      : [
          { x: 2.2, y: 3 },
          { x: 6.8, y: 3 },
        ];
  passers.forEach((id, i) => (positions[id] = { ...lanes[i]! }));
  positions[setter] = { ...settingSpot(team.system) };
  return positions;
}

/** Down ball: blockers stay at the net without jumping; the back row stands deeper. */
function downBall(team: TeamOnCourt): Positions {
  const deeper = (p: Point): Point => ({ x: p.x, y: Math.max(0.3, p.y - 1.5) });
  const spots = {
    4: DEFENSE_SPOTS[4],
    3: DEFENSE_SPOTS[3],
    2: DEFENSE_SPOTS[2],
    5: deeper(DEFENSE_SPOTS[5]),
    6: deeper(DEFENSE_SPOTS[6]),
    1: deeper(DEFENSE_SPOTS[1]),
  } as ZoneMap<Point>;
  return bySpotOf(team, spots);
}

/**
 * Every player's position in this phase. `from` (the previous phase's positions) only
 * matters for coverage, where players take the coverage spots nearest to them.
 */
export function phasePositions(team: TeamOnCourt, phase: RallyPhase, from?: Positions): Positions {
  switch (phase.kind) {
    case 'serve': {
      const positions = formationByZone(team, 'serve');
      if (team.serving) positions[team.zones[SERVING_ZONE]] = { ...SERVER_SPOT };
      return positions;
    }
    case 'receive':
      return formationByZone(team, 'receive');
    case 'switch':
      return bySpotOf(team, DEFENSE_SPOTS);
    case 'set':
    case 'transition':
      return attackSetup(team);
    case 'attack':
      return coverage(team, phase.option, from ?? attackSetup(team));
    case 'block':
      return bySpotOf(team, BLOCK_DEFENSE[phase.from]);
    case 'free-ball':
      return freeBall(team);
    case 'down-ball':
      return downBall(team);
  }
}

/** The players jumping to block in a block phase. */
export function blockers(team: TeamOnCourt, from: AttackSide): string[] {
  const at = playerAtSpot(team);
  return BLOCKING_SPOTS[from].map((spot) => at[spot]);
}

/** The opponent's positions (their own frame) in the shared court frame. */
export function mirrorToOpponent(positions: Positions): Positions {
  return Object.fromEntries(Object.entries(positions).map(([id, p]) => [id, toOpponentFrame(p)]));
}
