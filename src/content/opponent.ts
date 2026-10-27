import { toOpponentFrame } from '../domain/opponent';
import type { Player, Point, ZoneMap } from '../domain/types';
import { BASE_SPOTS, type FormationPlayer } from './formations';

/** Their server stands behind their end line in zone 1 (their frame). */
export const OPPONENT_SERVER_SPOT: Point = { x: 7.5, y: -1 };

/**
 * One generic opponent lineup: a 5-1 in rotation 1, serving. Positions are in the
 * opponent's own frame (y = 0 at their end line); the setter in zone 1 is the server,
 * and the other five players stand on the base spots of their zones.
 */
export const OPPONENT_SERVING: readonly FormationPlayer[] = [
  { id: 'them-s', role: 'S', label: 'S', zone: 1, position: OPPONENT_SERVER_SPOT },
  { id: 'them-oh1', role: 'OH', label: 'OH1', zone: 2, position: BASE_SPOTS[2] },
  { id: 'them-mb2', role: 'MB', label: 'MB2', zone: 3, position: BASE_SPOTS[3] },
  { id: 'them-opp', role: 'OPP', label: 'OPP', zone: 4, position: BASE_SPOTS[4] },
  { id: 'them-oh2', role: 'OH', label: 'OH2', zone: 5, position: BASE_SPOTS[5] },
  { id: 'them-mb1', role: 'MB', label: 'MB1', zone: 6, position: BASE_SPOTS[6] },
];

/**
 * The opponent lineup as the overlap rule sees it, in their frame. The server is exempt
 * from the overlap rule, so the server's zone-1 base spot (7.5, 3) stands in for them.
 */
export function opponentLineupForOverlap(): ZoneMap<Point> {
  return Object.fromEntries(
    OPPONENT_SERVING.map((p) => [p.zone, p.zone === 1 ? BASE_SPOTS[1] : p.position]),
  ) as ZoneMap<Point>;
}

/** Opponent players in the shared court frame, ready to draw. */
export function opponentPlayers(): Player[] {
  return OPPONENT_SERVING.map(({ id, role, label, position }) => ({
    id,
    role,
    label,
    team: 'them',
    position: toOpponentFrame(position),
  }));
}
