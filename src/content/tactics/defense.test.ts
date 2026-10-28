import { describe, expect, it } from 'vitest';
import { COURT_WIDTH, NET_Y } from '../../domain/court';
import { distanceBetween } from '../../domain/grading';
import type { Point } from '../../domain/types';
import { findTopic } from './index';

type Side = 'left' | 'right';

/** Who does what in each situation (our player ids), and on which sideline. */
const ROLES: Record<
  string,
  {
    blockers: string[];
    offBlockers: { id: string; side: Side }[];
    line: { id: string; side: Side };
    middleBack: string;
    crossCourt: { id: string; side: Side };
  }
> = {
  'attack-from-left-side': {
    blockers: ['opp', 'mb'],
    offBlockers: [{ id: 'oh1', side: 'left' }],
    line: { id: 's', side: 'right' },
    middleBack: 'l',
    crossCourt: { id: 'oh2', side: 'left' },
  },
  'attack-from-right-side': {
    blockers: ['oh1', 'mb'],
    offBlockers: [{ id: 'opp', side: 'right' }],
    line: { id: 'oh2', side: 'left' },
    middleBack: 'l',
    crossCourt: { id: 's', side: 'right' },
  },
  'attack-from-middle': {
    blockers: ['mb'],
    offBlockers: [
      { id: 'oh1', side: 'left' },
      { id: 'opp', side: 'right' },
    ],
    line: { id: 's', side: 'right' },
    middleBack: 'l',
    crossCourt: { id: 'oh2', side: 'left' },
  },
  'tip-over-the-block': {
    blockers: ['opp', 'mb'],
    offBlockers: [{ id: 'oh1', side: 'left' }],
    line: { id: 's', side: 'right' },
    middleBack: 'l',
    crossCourt: { id: 'oh2', side: 'left' },
  },
};

const fromNet = (p: Point) => NET_Y - p.y;
const fromSideline = (p: Point, side: Side) => (side === 'left' ? p.x : COURT_WIDTH - p.x);

const defense = findTopic('defense')!;

describe('defense topic', () => {
  it('has the four situations from the issue, each with a role map', () => {
    expect(defense.situations.map((s) => s.id)).toEqual(Object.keys(ROLES));
  });
});

describe.each(defense.situations.map((s) => [s.id, s] as const))('%s', (id, situation) => {
  const roles = ROLES[id]!;
  const { scene, keyMoment } = situation;
  const contact = scene.keyframes[keyMoment]!;
  const final = scene.keyframes[scene.keyframes.length - 1]!;
  const ours = scene.players.filter((p) => p.team === 'us').map((p) => p.id);
  const at = (id: string) => contact.positions[id]!;

  it('has six players of our team', () => {
    expect(ours).toHaveLength(6);
  });

  it('has a block of the stated size at the contact moment, at the net with no seam', () => {
    expect([...(contact.blocking ?? [])].sort()).toEqual([...roles.blockers].sort());
    const spots = roles.blockers.map(at);
    for (const spot of spots) {
      expect(spot.y).toBeLessThan(NET_Y);
      expect(fromNet(spot)).toBeLessThanOrEqual(1);
    }
    const xs = spots.map((p) => p.x).sort((a, b) => a - b);
    for (let i = 1; i < xs.length; i++) expect(xs[i]! - xs[i - 1]!).toBeLessThanOrEqual(1);
  });

  it('drops every off-blocker 2.5–4 m from the net, on its side of the court', () => {
    for (const { id: offBlocker, side } of roles.offBlockers) {
      expect(fromNet(at(offBlocker))).toBeGreaterThanOrEqual(2.5);
      expect(fromNet(at(offBlocker))).toBeLessThanOrEqual(4);
      expect(fromSideline(at(offBlocker), side)).toBeLessThanOrEqual(COURT_WIDTH / 2);
    }
  });

  it('puts the line defender 6–7 m from the net, within 1 m of the sideline', () => {
    const spot = at(roles.line.id);
    expect(fromNet(spot)).toBeGreaterThanOrEqual(6);
    expect(fromNet(spot)).toBeLessThanOrEqual(7);
    expect(fromSideline(spot, roles.line.side)).toBeLessThanOrEqual(1);
    expect(fromSideline(spot, roles.line.side)).toBeGreaterThanOrEqual(0);
  });

  it('puts the middle-back 8–9 m from the net', () => {
    expect(fromNet(at(roles.middleBack))).toBeGreaterThanOrEqual(8);
    expect(fromNet(at(roles.middleBack))).toBeLessThanOrEqual(9);
  });

  it('puts the cross-court defender 6–7 m from the net, near the far sideline', () => {
    const spot = at(roles.crossCourt.id);
    expect(fromNet(spot)).toBeGreaterThanOrEqual(6);
    expect(fromNet(spot)).toBeLessThanOrEqual(7);
    expect(fromSideline(spot, roles.crossCourt.side)).toBeLessThanOrEqual(1.5);
  });

  it('keeps defenders (non-blockers) at least 2 m apart at the final keyframe', () => {
    const defenders = ours.filter((id) => !roles.blockers.includes(id));
    for (let i = 0; i < defenders.length; i++) {
      for (let j = i + 1; j < defenders.length; j++) {
        const d = distanceBetween(final.positions[defenders[i]!]!, final.positions[defenders[j]!]!);
        expect(d, `${defenders[i]} and ${defenders[j]}`).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('who is attacking', () => {
  it('is explained for each attack position', () => {
    for (const id of ['attack-from-left-side', 'attack-from-right-side', 'attack-from-middle']) {
      const situation = defense.situations.find((s) => s.id === id)!;
      expect(situation.whoIsAttacking?.length).toBeGreaterThanOrEqual(2);
    }
  });
});
