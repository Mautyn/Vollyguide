import { describe, expect, it } from 'vitest';
import { clampToPlayableArea, NET_Y } from '../../domain/court';
import { findSituation, findTopic, TACTICS } from './index';

const situations = TACTICS.flatMap((topic) =>
  topic.situations.map((situation) => ({ topic: topic.id, id: situation.id, situation })),
);

describe('tactics topics', () => {
  it('have unique URL-safe ids for topics and situations', () => {
    const slug = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const topicIds = TACTICS.map((t) => t.id);
    expect(new Set(topicIds).size).toBe(topicIds.length);
    for (const topic of TACTICS) {
      expect(topic.id).toMatch(slug);
      const ids = topic.situations.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(slug);
    }
  });

  it('are found by id', () => {
    const blocking = findTopic('blocking')!;
    expect(findSituation(blocking, 'double-block-vs-outside')?.title).toMatch(/Double block/);
    expect(findTopic('nope')).toBeUndefined();
    expect(findSituation(blocking, 'nope')).toBeUndefined();
  });
});

describe.each(situations)('$topic / $id', ({ situation }) => {
  const { scene, keyMoment } = situation;
  const ids = scene.players.map((p) => p.id);

  it('has at least 2 keyframes with increasing times, starting at 0', () => {
    expect(scene.keyframes.length).toBeGreaterThanOrEqual(2);
    expect(scene.keyframes[0]!.time).toBe(0);
    for (let i = 1; i < scene.keyframes.length; i++) {
      expect(scene.keyframes[i]!.time).toBeGreaterThan(scene.keyframes[i - 1]!.time);
    }
  });

  it('positions every player in every keyframe, inside the court plus free zone', () => {
    for (const keyframe of scene.keyframes) {
      expect(Object.keys(keyframe.positions).sort()).toEqual([...ids].sort());
      for (const position of Object.values(keyframe.positions)) {
        expect(clampToPlayableArea(position)).toEqual(position);
      }
    }
  });

  it('has a caption for every keyframe and complete explanations', () => {
    for (const keyframe of scene.keyframes) expect(keyframe.caption.trim()).not.toBe('');
    expect(situation.positioning.length).toBeGreaterThan(0);
    expect(situation.execution.length).toBeGreaterThan(0);
    expect(situation.principles.length).toBeGreaterThanOrEqual(2);
    expect(situation.principles.length).toBeLessThanOrEqual(4);
  });

  it('only marks players of our team as blocking', () => {
    const ours = new Set(scene.players.filter((p) => p.team === 'us').map((p) => p.id));
    for (const keyframe of scene.keyframes) {
      for (const id of keyframe.blocking ?? []) expect(ours.has(id)).toBe(true);
    }
  });

  it('has a seamless block at the key moment, within 1 m of the net on our side', () => {
    const moment = scene.keyframes[keyMoment]!;
    const blockers = moment.blocking ?? [];
    expect(blockers.length).toBeGreaterThanOrEqual(2);

    const spots = blockers.map((id) => moment.positions[id]!);
    for (const spot of spots) {
      expect(spot.y).toBeLessThan(NET_Y);
      expect(NET_Y - spot.y).toBeLessThanOrEqual(1);
    }
    const xs = spots.map((s) => s.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) expect(xs[i]! - xs[i - 1]!).toBeLessThanOrEqual(1);
  });
});

describe('blocking situations', () => {
  const blocking = findTopic('blocking')!;
  const blockSize = (id: string) => {
    const s = findSituation(blocking, id)!;
    return s.scene.keyframes[s.keyMoment]!.blocking!.length;
  };

  it('use two blockers for double blocks and three for triple blocks', () => {
    expect(blockSize('double-block-vs-outside')).toBe(2);
    expect(blockSize('double-block-vs-right-side')).toBe(2);
    expect(blockSize('triple-block-vs-high-ball')).toBe(3);
    expect(blockSize('triple-block-vs-pipe')).toBe(3);
  });

  it('drop the off-blocker to the attack line (3 m from the net) in double blocks', () => {
    const offBlocker = { 'double-block-vs-outside': 'oh1', 'double-block-vs-right-side': 'opp' };
    for (const [id, player] of Object.entries(offBlocker)) {
      const s = findSituation(blocking, id)!;
      const spot = s.scene.keyframes[s.keyMoment]!.positions[player]!;
      expect(NET_Y - spot.y).toBeCloseTo(3, 0);
    }
  });
});
