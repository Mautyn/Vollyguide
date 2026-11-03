import {
  courtLineup,
  playRally,
  server,
  type MatchEvent,
  type MatchState,
  type Side,
} from '../../domain/match';
import { toOpponentFrame } from '../../domain/opponent';
import type { Keyframe, Scene, ScenePlayer } from '../../domain/scene';
import type { Point, Role, System } from '../../domain/types';
import { ZONES } from '../../domain/zones';
import type { Locale } from '../../i18n/locale';
import { localizeLabel } from '../../i18n/labels';
import { LIBERO_REPLACEMENT_SPOT } from '../libero';
import { simCaptions } from './captions';
import {
  attackerId,
  availableAttacks,
  blockers,
  CONTACT,
  mirrorToOpponent,
  phasePositions,
  settingSetterId,
  settingSpot,
  type AttackOption,
  type AttackSide,
  type Positions,
  type TeamOnCourt,
} from './positions';
import { simulationPlayers, teamOnCourt } from './teams';

/**
 * One action in a rally. Our team attacks with an attack option; the opponent attacks
 * from a side or only sends a free ball or a down ball (#48).
 */
export type RallyStep =
  | { by: 'us'; attack: AttackOption }
  | { by: 'them'; attack: AttackSide | 'free-ball' | 'down-ball' };

export interface RallyChoices {
  /** Actions in order: the receiving team acts first, then the teams take turns. */
  steps: RallyStep[];
  winner: Side;
}

export interface Rally {
  scene: Scene;
  next: MatchState;
  events: MatchEvent[];
}

const OTHER: Record<Side, Side> = { us: 'them', them: 'us' };

/** Where an attack option comes from, seen by the attacking team. */
export const SIDE_OF: Record<AttackOption, AttackSide> = {
  outside: 'left',
  middle: 'middle',
  right: 'right',
  pipe: 'middle',
};

/** The opponent's attack option for a side (a pipe when they have no middle quick). */
function themOption(team: TeamOnCourt, side: AttackSide): AttackOption | null {
  const options = availableAttacks(team);
  const wanted: AttackOption[] =
    side === 'left' ? ['outside'] : side === 'right' ? ['right'] : ['middle', 'pipe'];
  return wanted.find((o) => options.includes(o)) ?? null;
}

/** What the acting team may choose next, or null when it is the other team's turn. */
export function choicesFor(
  state: MatchState,
  side: Side,
  afterEasyBall = false,
): RallyStep['attack'][] {
  const team = teamOnCourt(state, side);
  if (side === 'us') return availableAttacks(team);
  const sides = (['left', 'middle', 'right'] as const).filter((s) => themOption(team, s));
  return afterEasyBall ? sides : [...sides, 'free-ball', 'down-ball'];
}

/** Who acts next in this rally, and with which choices. */
export function nextActor(match: MatchState, steps: RallyStep[]): { side: Side; easy: boolean } {
  const last = steps.at(-1);
  const side: Side = last
    ? last.by === 'us'
      ? 'them'
      : 'us'
    : match.serving === 'us'
      ? 'them'
      : 'us';
  const easy = last?.by === 'them' && last.attack.endsWith('-ball');
  return { side, easy };
}

/** Throws if the steps cannot happen in this rally. */
export function checkChoices(state: MatchState, choices: RallyChoices): void {
  let side: Side = OTHER[state.serving];
  if (choices.steps.length === 0) throw new Error('A rally needs at least one action');
  choices.steps.forEach((step, i) => {
    if (step.by !== side) throw new Error(`Step ${i + 1} must be by ${side}`);
    const previous = choices.steps[i - 1];
    const easy =
      previous !== undefined && previous.by === 'them' && previous.attack.endsWith('-ball');
    if (!choicesFor(state, side, easy).includes(step.attack)) {
      throw new Error(`Step ${i + 1}: ${step.attack} is not possible here`);
    }
    side = OTHER[side];
  });
}

/** A player as captions show them: the Polish abbreviation in Polish, "their …" for the opponent. */
export function playerName(id: string, system: System, locale: Locale): string {
  const roster = simulationPlayers(system);
  const player = [...roster.us, ...roster.them].find((p) => p.id === id);
  if (!player) return id;
  return simCaptions(locale).who(
    localizeLabel(player.label, player.role, locale),
    !id.startsWith('them-'),
  );
}

/** Builds the scene for one rally, plus the state after it and what changed. */
export function buildRally(
  state: MatchState,
  choices: RallyChoices,
  locale: Locale,
  index = 1,
): Rally {
  checkChoices(state, choices);
  const captions = simCaptions(locale);
  // Every caption sentence starts with a capital, also when it starts with "their OH1".
  const t = Object.fromEntries(
    Object.entries(captions).map(([key, build]) => [
      key,
      key === 'who'
        ? build
        : (...args: never[]) => capitalize((build as (...a: never[]) => string)(...args)),
    ]),
  ) as unknown as typeof captions;
  const system = state.us.system;
  const roster = simulationPlayers(system);
  const labels: Record<string, { label: string; role: Role }> = Object.fromEntries(
    [...roster.us, ...roster.them].map((p) => [p.id, { label: p.label, role: p.role }]),
  );
  const ourIds = state.us.libero
    ? roster.us.map((p) => p.id)
    : roster.us.filter((p) => p.role !== 'L').map((p) => p.id);
  const sideOf = (id: string): Side => (id.startsWith('them-') ? 'them' : 'us');
  const who = (id: string) =>
    t.who(localizeLabel(labels[id]!.label, labels[id]!.role, locale), sideOf(id) === 'us');

  const teams: Record<Side, TeamOnCourt> = {
    us: teamOnCourt(state, 'us'),
    them: teamOnCourt(state, 'them'),
  };
  const toShared = (side: Side, positions: Positions) =>
    side === 'us' ? positions : mirrorToOpponent(positions);
  const pointFor = (side: Side, p: Point): Point => (side === 'us' ? p : toOpponentFrame(p));

  /** Every player in the scene: on court where the phases put them, the rest on the bench. */
  const frame = (
    us: Positions,
    them: Positions,
    rest: Omit<Keyframe, 'positions' | 'time'>,
    onCourtUs: readonly string[] = ZONES.map((z) => teams.us.zones[z]),
  ): Omit<Keyframe, 'time'> => {
    const positions: Record<string, Point> = { ...toShared('them', them) };
    for (const id of ourIds) {
      positions[id] = onCourtUs.includes(id) ? us[id]! : { ...LIBERO_REPLACEMENT_SPOT };
    }
    return { positions, ...rest };
  };

  const serving = state.serving;
  const receiving = OTHER[serving];
  const at: Record<Side, Positions> = {
    [serving]: phasePositions(teams[serving], { kind: 'serve' }),
    [receiving]: phasePositions(teams[receiving], { kind: 'receive' }),
  } as Record<Side, Positions>;
  const serverId = server(state);
  const keyframes: Omit<Keyframe, 'time'>[] = [];
  const durations: number[] = [];
  const push = (k: Omit<Keyframe, 'time'>, seconds: number) => {
    keyframes.push(k);
    durations.push(seconds);
  };

  push(
    frame(at.us, at.them, {
      ball: { position: pointFor(serving, { x: 7.9, y: -1 }), height: 'low' },
      caption: t.serve(who(serverId)),
    }),
    1.4,
  );

  // The pass: the receiving team stays in formation; the servers switch.
  const passer = passerOf(teams[receiving], at[receiving]);
  at[serving] = phasePositions(teams[serving], { kind: 'switch' });
  push(
    frame(at.us, at.them, {
      ball: { position: pointFor(receiving, at[receiving][passer]!), height: 'low' },
      caption: `${t.pass(receiving === 'us')} ${t.switched(serving === 'us')}`,
    }),
    1,
  );

  let last: { side: Side; option: AttackOption | null } = { side: receiving, option: null };
  choices.steps.forEach((step, i) => {
    const side = step.by;
    const other = OTHER[side];
    const team = teams[side];
    if (step.attack === 'free-ball' || step.attack === 'down-ball') {
      const kind = step.attack;
      at[side] = phasePositions(team, { kind: 'switch' });
      at[other] = phasePositions(teams[other], { kind });
      push(
        frame(at.us, at.them, {
          ball: {
            position: pointFor(side, { x: 4.5, y: 7 }),
            height: kind === 'free-ball' ? 'high' : 'low',
          },
          caption: kind === 'free-ball' ? t.freeBall(side === 'us') : t.downBall(side === 'us'),
        }),
        1.2,
      );
      last = { side, option: null };
      return;
    }
    const option: AttackOption =
      side === 'us' ? (step.attack as AttackOption) : themOption(team, step.attack as AttackSide)!;
    const setter = settingSetterId(team);
    const attacker = attackerId(team, option);
    at[side] = phasePositions(team, { kind: i === 0 ? 'set' : 'transition' });
    // The other team waits in its ready spots (it attacked last, or sent an easy ball).
    at[other] = phasePositions(teams[other], { kind: 'switch' });
    push(
      frame(at.us, at.them, {
        ball: { position: pointFor(side, settingSpot(team.system)), height: 'high' },
        caption: t.set(who(setter), who(attacker), option),
      }),
      1,
    );
    at[side] = phasePositions(team, { kind: 'attack', option }, at[side]);
    const from = SIDE_OF[option];
    at[other] = phasePositions(teams[other], { kind: 'block', from });
    const jumping = blockers(teams[other], from);
    push(
      frame(at.us, at.them, {
        ball: { position: pointFor(side, CONTACT[option]), height: 'high' },
        blocking: jumping,
        caption: t.attack(who(attacker), other === 'us', jumping.length),
      }),
      1,
    );
    last = { side, option };
    if (i < choices.steps.length - 1) {
      // The defenders dig; the next step is their counter-attack.
      const digger = diggerOf(teams[other], at[other]);
      push(
        frame(at.us, at.them, {
          ball: { position: pointFor(other, at[other][digger]!), height: 'low' },
          caption: t.dig(other === 'us'),
        }),
        0.9,
      );
    }
  });

  // The point: the ball lands on the loser's side.
  const { state: next, events } = playRally(state, choices.winner);
  const loser = OTHER[choices.winner];
  const landing = pointFor(loser, loser === last.side ? { x: 4.5, y: 7.6 } : { x: 2, y: 2 });
  push(
    frame(at.us, at.them, {
      ball: { position: landing, height: 'low' },
      caption: t.point(choices.winner === 'us', next.score.us, next.score.them),
    }),
    1.4,
  );

  // What follows: both teams line up for the next serve.
  const nextTeams: Record<Side, TeamOnCourt> = {
    us: teamOnCourt(next, 'us'),
    them: teamOnCourt(next, 'them'),
  };
  const nextAt = (side: Side) =>
    phasePositions(nextTeams[side], { kind: next.serving === side ? 'serve' : 'receive' });
  const after = events.flatMap((e): string[] => {
    switch (e.kind) {
      case 'side-out':
        return [t.sideOut(e.team === 'us', e.rotation)];
      case 'server':
        return [t.server(who(e.id), e.id === serverId)];
      case 'libero-in':
        return e.team === 'us' ? [t.liberoIn(who(e.replaces))] : [];
      case 'libero-out':
        return e.team === 'us' ? [t.liberoOut(who(e.back))] : [];
      default:
        return [];
    }
  });
  push(
    frame(
      nextAt('us'),
      nextAt('them'),
      {
        ball: { position: pointFor(next.serving, { x: 7.9, y: -1 }), height: 'low' },
        caption: after.join(' '),
      },
      ZONES.map((z) => courtLineup(next, 'us').zones[z]),
    ),
    0,
  );

  let time = 0;
  const timed: Keyframe[] = keyframes.map((k, i) => {
    const out = { ...k, time: Math.round(time * 10) / 10 };
    time += durations[i]!;
    return out;
  });

  const players: ScenePlayer[] = [
    ...ourIds.map((id) => ({ id, team: 'us' as const, ...labels[id]! })),
    ...roster.them.map((p) => ({ id: p.id, team: 'them' as const, role: p.role, label: p.label })),
  ];
  return {
    scene: { id: `rally-${index}`, title: `Rally ${index}`, players, keyframes: timed },
    next,
    events,
  };
}

/** The receiving player who passes the serve: the back-row passer nearest the middle. */
function passerOf(team: TeamOnCourt, positions: Positions): string {
  const setter = settingSetterId(team);
  const candidates = ZONES.map((z) => team.zones[z]).filter((id) => id !== setter);
  const target = { x: 4.5, y: 4 };
  return candidates.reduce((best, id) =>
    dist(positions[id]!, target) < dist(positions[best]!, target) ? id : best,
  );
}

/** The defender who digs: the deepest player in the middle of the court. */
function diggerOf(team: TeamOnCourt, positions: Positions): string {
  const ids = ZONES.map((z) => team.zones[z]);
  const target = { x: 4.5, y: 1.5 };
  return ids.reduce((best, id) =>
    dist(positions[id]!, target) < dist(positions[best]!, target) ? id : best,
  );
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
