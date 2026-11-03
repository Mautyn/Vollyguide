import { describe, expect, it } from 'vitest';
import { FREE_ZONE, NET_Y } from '../../domain/court';
import { distanceBetween } from '../../domain/grading';
import {
  newMatch,
  playRally,
  serveViolations,
  type MatchState,
  type Side,
} from '../../domain/match';
import type { Point, System, ZoneMap } from '../../domain/types';
import { ZONES } from '../../domain/zones';
import { BASE_SPOTS } from '../formations';
import { SYSTEMS } from '../systems';
import {
  attackerId,
  availableAttacks,
  blockers,
  CONTACT,
  mirrorToOpponent,
  phasePositions,
  settingSetterId,
  settingSpot,
  type AttackSide,
  type Positions,
  type RallyPhase,
  type TeamOnCourt,
} from './positions';
import { opponentTeam, ourTeam, teamOnCourt } from './teams';

/** Every rotation, both serving and receiving: alternate side-outs and lost serves. */
function states(system: System, libero: boolean): MatchState[] {
  let state = newMatch(ourTeam(system, 1, libero), opponentTeam(1), 'them');
  const all = [state];
  for (let i = 0; i < 12; i++) {
    state = playRally(state, (i % 2 === 0 ? 'us' : 'them') as Side).state;
    all.push(state);
  }
  return all;
}

const SIDES: readonly AttackSide[] = ['left', 'middle', 'right'];

interface Case {
  name: string;
  team: TeamOnCourt;
}

const CASES: Case[] = SYSTEMS.flatMap((system) =>
  [true, false].flatMap((libero) =>
    states(system, libero).flatMap((state, i) =>
      (['us', 'them'] as const).map((side) => ({
        name: `${system} libero ${libero} step ${i} ${side}`,
        team: teamOnCourt(state, side),
      })),
    ),
  ),
);

function phasesOf(team: TeamOnCourt): RallyPhase[] {
  return [
    { kind: team.serving ? 'serve' : 'receive' },
    { kind: 'switch' },
    { kind: 'set' },
    { kind: 'transition' },
    ...availableAttacks(team).map((option) => ({ kind: 'attack', option }) as RallyPhase),
    ...SIDES.map((from) => ({ kind: 'block', from }) as RallyPhase),
    { kind: 'free-ball' },
    { kind: 'down-ball' },
  ];
}

const onCourt = (team: TeamOnCourt) => ZONES.map((z) => team.zones[z]);

describe.each(CASES)('$name', ({ team }) => {
  const libero = onCourt(team).find((id) => team.roles[id] === 'L');

  it.each(phasesOf(team).map((p) => [JSON.stringify(p), p] as const))(
    '%s: everyone placed, inside the area, apart, libero off the net',
    (_, phase) => {
      const positions = phasePositions(team, phase);
      expect(Object.keys(positions).sort()).toEqual(onCourt(team).sort());
      for (const p of Object.values(positions)) {
        expect(p.x).toBeGreaterThanOrEqual(-FREE_ZONE);
        expect(p.x).toBeLessThanOrEqual(9 + FREE_ZONE);
        expect(p.y).toBeGreaterThanOrEqual(-FREE_ZONE);
        expect(p.y).toBeLessThan(NET_Y);
      }
      const ids = Object.keys(positions);
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const d = distanceBetween(positions[ids[i]!]!, positions[ids[j]!]!);
          expect(d, `${ids[i]} and ${ids[j]}`).toBeGreaterThanOrEqual(0.5);
        }
      }
      if (libero) expect(NET_Y - positions[libero]!.y).toBeGreaterThanOrEqual(1);
    },
  );

  it('is overlap-legal at the serve (server exempt)', () => {
    const positions = phasePositions(team, { kind: team.serving ? 'serve' : 'receive' });
    const lineup = Object.fromEntries(
      ZONES.map((z) => [z, positions[team.zones[z]]]),
    ) as ZoneMap<Point>;
    expect(serveViolations(lineup, team.serving, BASE_SPOTS[1])).toEqual([]);
  });

  it('puts the setting setter on the setting spot when setting up an attack', () => {
    const setter = settingSetterId(team);
    for (const kind of ['set', 'transition', 'free-ball'] as const) {
      expect(phasePositions(team, { kind })[setter]).toEqual(settingSpot(team.system));
    }
  });

  it.each(['outside', 'middle', 'right', 'pipe'] as const)('%s attack: 2-3 coverage', (option) => {
    if (!availableAttacks(team).includes(option)) return;
    const attacker = attackerId(team, option);
    expect(team.roles[attacker]).not.toBe('L');
    expect(attacker).not.toBe(settingSetterId(team));
    const positions: Positions = phasePositions(team, { kind: 'attack', option });
    expect(positions[attacker]).toEqual(CONTACT[option]);
    const others = Object.keys(positions).filter((id) => id !== attacker);
    const close = others.filter((id) => distanceBetween(positions[id]!, CONTACT[option]) <= 2.5);
    expect(close).toHaveLength(2);
    expect(close).toContain(settingSetterId(team));
    const deep = others.filter((id) => !close.includes(id));
    for (const id of deep) {
      const fromNet = NET_Y - positions[id]!.y;
      expect(fromNet).toBeGreaterThanOrEqual(4);
      expect(fromNet).toBeLessThanOrEqual(6.5);
    }
  });

  it.each(SIDES)('block against an attack from the %s: blockers at the net', (from) => {
    const positions = phasePositions(team, { kind: 'block', from });
    const jumping = blockers(team, from);
    expect(jumping).toHaveLength(from === 'middle' ? 1 : 2);
    for (const id of jumping) {
      expect(NET_Y - positions[id]!.y).toBeLessThanOrEqual(0.6);
      expect(team.roles[id]).not.toBe('L');
    }
  });

  it('offers at least two attacks, always the pipe, and no middle quick in 4-2', () => {
    const options = availableAttacks(team);
    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options).toContain('pipe');
    if (team.system === '4-2') expect(options).not.toContain('middle');
  });
});

describe('the opponent', () => {
  it('is drawn on the far half of the shared court', () => {
    const them = teamOnCourt(newMatch(ourTeam('5-1', 1, true), opponentTeam(1), 'them'), 'them');
    for (const p of Object.values(mirrorToOpponent(phasePositions(them, { kind: 'switch' })))) {
      expect(p.y).toBeGreaterThan(NET_Y);
    }
  });

  it('starts in any rotation', () => {
    expect(opponentTeam(4).zones[4]).toBe('them-s');
  });
});
