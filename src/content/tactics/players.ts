import type { ScenePlayer } from '../../domain/scene';

/**
 * Our team in a 5-1 after the serve, once players have switched to their specialist
 * positions: outside hitter left front, middle blocker in the middle, opposite right front;
 * outside hitter left back, libero middle back, setter right back.
 */
export const OUR_TEAM: readonly ScenePlayer[] = [
  { id: 'oh1', role: 'OH', label: 'OH1', team: 'us' },
  { id: 'mb', role: 'MB', label: 'MB', team: 'us' },
  { id: 'opp', role: 'OPP', label: 'OPP', team: 'us' },
  { id: 'oh2', role: 'OH', label: 'OH2', team: 'us' },
  { id: 'l', role: 'L', label: 'L', team: 'us' },
  { id: 's', role: 'S', label: 'S', team: 'us' },
];

/** The opponent's setter and the player attacking in this situation. */
export function opponentPair(attacker: Omit<ScenePlayer, 'id' | 'team'>): ScenePlayer[] {
  return [
    { id: 'them-s', role: 'S', label: 'S', team: 'them' },
    { id: 'them-attacker', team: 'them', ...attacker },
  ];
}

/** Our base positions while the opponent passes: blockers at the net, defenders back. */
export const OUR_READY = {
  oh1: { x: 1, y: 8.4 },
  mb: { x: 4.5, y: 8.4 },
  opp: { x: 8, y: 8.4 },
  oh2: { x: 1.5, y: 3.5 },
  l: { x: 4.5, y: 2 },
  s: { x: 7.5, y: 3.5 },
} as const;

/** The opponent setter waits near the net in their right-front zone (our left, shared frame). */
export const OPPONENT_SETTER = { x: 2.5, y: 9.6 } as const;
