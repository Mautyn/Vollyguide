import { describe, expect, it } from 'vitest';
import { NET_Y } from '../../domain/court';
import { distanceBetween } from '../../domain/grading';
import { findTopic } from './index';

/** Within this distance of the hitter's x, a player standing nearer the net blocks the lane. */
const LANE_HALF_WIDTH_M = 1;
const INNER_RING_M = 2.5;

const coverage = findTopic('coverage')!;

describe('coverage topic', () => {
  it('has the four attacks from the issue', () => {
    expect(coverage.situations.map((s) => s.title)).toEqual([
      'Outside hitter attacks from zone 4',
      'Opposite attacks from zone 2',
      'Middle blocker attacks a quick in zone 3',
      'Back-row attack (pipe) from zone 6',
    ]);
  });
});

describe.each(coverage.situations.map((s) => [s.id, s] as const))('%s', (_, situation) => {
  const moment = situation.scene.keyframes[situation.keyMoment]!;
  const attackerId = situation.attacker!;
  const attacker = moment.positions[attackerId]!;
  const ours = situation.scene.players.filter((p) => p.team === 'us' && p.id !== attackerId);
  const distanceTo = (id: string) => distanceBetween(moment.positions[id]!, attacker);
  const inner = ours.filter((p) => distanceTo(p.id) <= INNER_RING_M).map((p) => p.id);
  const outer = ours.filter((p) => !inner.includes(p.id)).map((p) => p.id);

  it('names one of our players as the attacker, with the ball at the hitter at contact', () => {
    expect(ours).toHaveLength(5);
    expect(moment.ball?.height).toBeDefined();
    expect(distanceBetween(moment.ball!.position, attacker)).toBeLessThan(1);
  });

  it('has exactly three players in the inner ring, including the setter', () => {
    expect(inner).toHaveLength(3);
    expect(inner).toContain('s');
  });

  it('keeps the other two 3.5–6 m from the net', () => {
    expect(outer).toHaveLength(2);
    for (const id of outer) {
      const fromNet = NET_Y - moment.positions[id]!.y;
      expect(fromNet).toBeGreaterThanOrEqual(3.5);
      expect(fromNet).toBeLessThanOrEqual(6);
    }
  });

  it('leaves the lane between the hitter and the net clear', () => {
    for (const p of ours) {
      const spot = moment.positions[p.id]!;
      const inLane = Math.abs(spot.x - attacker.x) < LANE_HALF_WIDTH_M && spot.y > attacker.y;
      expect(inLane, `${p.id} stands between the hitter and the net`).toBe(false);
    }
  });

  it('does not crowd the cup: coverers at least 1 m apart', () => {
    for (let i = 0; i < ours.length; i++) {
      for (let j = i + 1; j < ours.length; j++) {
        const d = distanceBetween(moment.positions[ours[i]!.id]!, moment.positions[ours[j]!.id]!);
        expect(d, `${ours[i]!.id} and ${ours[j]!.id}`).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
