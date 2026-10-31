import { SERVING_ZONE, switchZones } from '../domain/serve';
import type { Point, Role, System, Zone, ZoneMap } from '../domain/types';

import { BASE_SPOTS, type Formation } from './formations';

/** Our server stands behind our end line, in line with zone 1. */
export const SERVER_SPOT: Point = { x: 7.5, y: -1 };

/** The middle blocker the libero serves for (USAV/NCAA: one rotation per set). */
export const LIBERO_SERVES_FOR = 'mb1';

/**
 * Where players stand right after our serve, ready for defense (perimeter system).
 * The back-row spots match the ready positions in tactics/defense.ts.
 */
export const DEFENSE_SPOTS: ZoneMap<Point> = {
  4: { x: 1.5, y: 8.4 },
  3: { x: 4.5, y: 8.4 },
  2: { x: 7.5, y: 8.4 },
  5: { x: 1.2, y: 3 },
  6: { x: 4.8, y: 1.2 },
  1: { x: 8, y: 3 },
};

const SERVE_NOTES: Readonly<Record<System, string>> = {
  '5-1':
    'The zone-1 player serves from behind the end line; with the libero on, the libero serves in MB1’s turn (USAV/NCAA rule, not FIVB). After the serve the front row switches to OH left, MB middle, opposite or setter right; the back row to libero or MB left, OH middle, setter or opposite right.',
  '6-2':
    'The zone-1 player serves from behind the end line; with the libero on, the libero serves in MB1’s turn (USAV/NCAA rule, not FIVB). After the serve the front row switches to OH left, MB middle, front-row setter right (it attacks as the opposite); the back row to libero or MB left, OH middle, setter right.',
  '4-2':
    'The zone-1 player serves from behind the end line; with the libero on, the libero serves in MB1’s turn (USAV/NCAA rule, not FIVB). After the serve the front row switches to OH left, front-row setter middle (it sets from zone 3), MB right; the back row to libero or MB left, OH middle, setter right.',
};

/** Our serve: base spots, with the zone-1 player behind the end line to serve. */
export function serveFormation(base: Formation): Formation {
  return {
    ...base,
    id: `${base.system}-r${base.rotation}-serve`,
    phase: 'serve',
    note: SERVE_NOTES[base.system],
    players: base.players.map((p) => ({
      ...p,
      position: { ...(p.zone === SERVING_ZONE ? SERVER_SPOT : BASE_SPOTS[p.zone]) },
    })),
  };
}

/** Where each player of a serve formation (libero applied or not) goes right after the serve. */
export function defensePositions(formation: Formation): Record<string, Point> {
  const roles = Object.fromEntries(formation.players.map((p) => [p.zone, p.role])) as ZoneMap<Role>;
  const targets = switchZones(formation.system, roles);
  return Object.fromEntries(
    formation.players.map((p) => [p.id, { ...DEFENSE_SPOTS[targets[p.zone] as Zone] }]),
  );
}
