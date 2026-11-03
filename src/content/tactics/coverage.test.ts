import { describe, expect, it } from 'vitest';
import { NET_Y } from '../../domain/court';
import { distanceBetween } from '../../domain/grading';
import { findTopic } from './index';

/** Within this distance of the hitter's x, a player standing nearer the net blocks the lane. */
const LANE_HALF_WIDTH_M = 1;
/** 2-3 coverage: two players this close to the hitter, three in a deep line. */
const CLOSE_M = 2.5;
const DEEP_FROM_NET_M = [4, 6.5] as const;

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
  const close = ours.filter((p) => distanceTo(p.id) <= CLOSE_M).map((p) => p.id);
  const deep = ours.filter((p) => !close.includes(p.id)).map((p) => p.id);

  it('names one of our players as the attacker, with the ball at the hitter at contact', () => {
    expect(ours).toHaveLength(5);
    expect(moment.ball?.height).toBeDefined();
    expect(distanceBetween(moment.ball!.position, attacker)).toBeLessThan(1);
  });

  it('covers 2-3: exactly two players close to the hitter, including the setter', () => {
    expect(close).toHaveLength(2);
    expect(close).toContain('s');
  });

  it('puts the other three in a deep line 4–6.5 m from the net, spread across the court', () => {
    expect(deep).toHaveLength(3);
    for (const id of deep) {
      const fromNet = NET_Y - moment.positions[id]!.y;
      expect(fromNet, id).toBeGreaterThanOrEqual(DEEP_FROM_NET_M[0]);
      expect(fromNet, id).toBeLessThanOrEqual(DEEP_FROM_NET_M[1]);
    }
    const xs = deep.map((id) => moment.positions[id]!.x).sort((a, b) => a - b);
    expect(xs[2]! - xs[0]!, 'deep line width').toBeGreaterThanOrEqual(3.5);
  });

  it('lets nobody run more than 3.5 m between two moments a second apart', () => {
    const frames = situation.scene.keyframes;
    for (let i = 1; i < frames.length; i++) {
      const seconds = frames[i]!.time - frames[i - 1]!.time;
      for (const p of ours) {
        const d = distanceBetween(frames[i]!.positions[p.id]!, frames[i - 1]!.positions[p.id]!);
        expect(d / seconds, `${p.id} before keyframe ${i}`).toBeLessThanOrEqual(4.5);
      }
    }
  });

  it('leaves the lane between the hitter and the net clear', () => {
    for (const p of ours) {
      const spot = moment.positions[p.id]!;
      const inLane = Math.abs(spot.x - attacker.x) < LANE_HALF_WIDTH_M && spot.y > attacker.y;
      expect(inLane, `${p.id} stands between the hitter and the net`).toBe(false);
    }
  });

  it('does not crowd the coverage: coverers at least 1 m apart', () => {
    for (let i = 0; i < ours.length; i++) {
      for (let j = i + 1; j < ours.length; j++) {
        const d = distanceBetween(moment.positions[ours[i]!.id]!, moment.positions[ours[j]!.id]!);
        expect(d, `${ours[i]!.id} and ${ours[j]!.id}`).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
