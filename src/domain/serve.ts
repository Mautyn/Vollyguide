import { applyLibero, type RosterEntry } from './libero';
import type { Point, Role, System, Zone, ZoneMap } from './types';
import { isFrontRow, ZONES } from './zones';

/** The zone whose player serves. */
export const SERVING_ZONE: Zone = 1;

/** Who serves: the player in zone 1. */
export function serverId(zones: ZoneMap<string>): string {
  return zones[SERVING_ZONE];
}

/**
 * The libero at the moment of our serve, under the USAV/NCAA rule: the libero may serve,
 * but in only one rotation per set. It replaces the back-row middle blocker as usual; when
 * that middle blocker is in zone 1, the libero serves only for `servesFor`. For the other
 * middle blocker it stays off court (`liberoOff`) and that middle blocker serves.
 * FIVB does not let the libero serve at all; this app follows USAV/NCAA by choice.
 */
export function applyLiberoAtServe(
  zones: ZoneMap<string>,
  players: readonly RosterEntry[],
  libero: RosterEntry,
  servesFor: string,
): { zones: ZoneMap<string>; replaced: string | null; liberoOff: boolean } {
  const result = applyLibero(zones, players, libero);
  if (result.replaced !== null && zones[SERVING_ZONE] === result.replaced) {
    if (result.replaced !== servesFor)
      return { zones: { ...zones }, replaced: null, liberoOff: true };
  }
  return { ...result, liberoOff: result.replaced === null };
}

/**
 * The lineup as the overlap rule sees it: the server is exempt, so a stand-in point (the
 * zone-1 base spot) replaces wherever the server is standing.
 */
export function withServerExempt(lineup: ZoneMap<Point>, standIn: Point): ZoneMap<Point> {
  return { ...lineup, [SERVING_ZONE]: { ...standIn } };
}

/** Where each front-row role goes after the serve, per system. */
const FRONT_SWITCH: Readonly<Record<System, Partial<Record<Role, Zone>>>> = {
  // OH left, MB middle, opposite (or the setter when it is in the front row) right.
  '5-1': { OH: 4, MB: 3, OPP: 2, S: 2 },
  // The front-row setter attacks as the opposite, on the right.
  '6-2': { OH: 4, MB: 3, S: 2 },
  // The front-row setter sets from zone 3, so the middle blocker moves to the right.
  '4-2': { OH: 4, S: 3, MB: 2 },
};

/** Back row after the serve (perimeter defense): L or MB left back, OH middle back, S or OPP right back. */
const BACK_SWITCH: Readonly<Partial<Record<Role, Zone>>> = { L: 5, MB: 5, OH: 6, S: 1, OPP: 1 };

/**
 * The zone each player switches to right after our serve, given the role standing in
 * each zone at the moment of serve. Front-row players stay in the front row and back-row
 * players in the back row. Throws if the roles do not make one player per zone.
 */
export function switchZones(system: System, roles: ZoneMap<Role>): ZoneMap<Zone> {
  const targets = {} as ZoneMap<Zone>;
  const taken = new Set<Zone>();
  for (const zone of ZONES) {
    const role = roles[zone];
    const target = isFrontRow(zone) ? FRONT_SWITCH[system][role] : BACK_SWITCH[role];
    if (target === undefined || taken.has(target)) {
      throw new Error(`No ${system} switch spot for ${role} in zone ${zone}`);
    }
    taken.add(target);
    targets[zone] = target;
  }
  return targets;
}
