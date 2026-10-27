import { describe, expect, it } from 'vitest';
import { isInsideCourt, NET_Y } from '../domain/court';
import { isLegalLineup } from '../domain/overlap';
import { toOpponentFrame } from '../domain/opponent';
import { OPPONENT_SERVING, opponentLineupForOverlap, opponentPlayers } from './opponent';

describe('opponent serving lineup', () => {
  it('has one player per zone, with the server behind their end line in zone 1', () => {
    expect(OPPONENT_SERVING.map((p) => p.zone).sort()).toEqual([1, 2, 3, 4, 5, 6]);
    const server = OPPONENT_SERVING.find((p) => p.zone === 1)!;
    expect(server.position).toEqual({ x: 7.5, y: -1 });
    expect(isInsideCourt(server.position)).toBe(false);
  });

  it('is legal in their frame, with the server replaced by the zone-1 base spot', () => {
    const lineup = opponentLineupForOverlap();
    expect(lineup[1]).toEqual({ x: 7.5, y: 3 });
    expect(isLegalLineup(lineup)).toBe(true);
  });

  it('is drawn on the far side of the net in the shared frame', () => {
    const players = opponentPlayers();
    expect(players).toHaveLength(6);
    expect(players.every((p) => p.team === 'them')).toBe(true);
    for (const p of players) expect(p.position.y).toBeGreaterThan(NET_Y);
    // Their server: behind their end line, on our left as we look at the court.
    expect(players.find((p) => p.id === 'them-s')!.position).toEqual(
      toOpponentFrame({ x: 7.5, y: -1 }),
    );
    expect(players.find((p) => p.id === 'them-s')!.position).toEqual({ x: 1.5, y: 19 });
  });

  it('uses ids that cannot clash with our players', () => {
    for (const p of OPPONENT_SERVING) expect(p.id.startsWith('them-')).toBe(true);
  });
});
