import { NET_Y } from './court';
import { toOpponentFrame } from './opponent';
import type { Point, Team } from './types';

/** A position as players and coaches describe it: depth from the net, width from the left. */
export interface NetRelative {
  /** Meters from the net on the team's own side; negative means across the net. */
  fromNet: number;
  /** Meters from the team's own left sideline, as seen from behind its end line. */
  fromLeft: number;
}

/**
 * Converts a stored position (shared court frame: y = 0 at our end line) to how it is
 * shown to users: the net is 0 m for both teams, and "left" is each team's own left.
 */
export function toNetRelative(point: Point, team: Team): NetRelative {
  const own = team === 'us' ? point : toOpponentFrame(point);
  return { fromNet: NET_Y - own.y, fromLeft: own.x };
}
