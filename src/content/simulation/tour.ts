import { newMatch, type MatchState, type Side } from '../../domain/match';
import type { System } from '../../domain/types';
import type { Locale } from '../../i18n/locale';
import type { AttackOption, AttackSide } from './positions';
import { buildRally, choicesFor, type Rally, type RallyStep } from './rally';
import { opponentTeam, ourTeam } from './teams';

type Them = AttackSide | 'free-ball' | 'down-ball';

/** A step of the tour: preferred choices in order; the first one possible is used. */
type TourStep = { by: 'us'; prefer: AttackOption[] } | { by: 'them'; prefer: Them[] };

interface TourRally {
  steps: TourStep[];
  winner: Side;
}

const us = (...prefer: AttackOption[]): TourStep => ({ by: 'us', prefer });
const them = (...prefer: Them[]): TourStep => ({ by: 'them', prefer });

/**
 * The automatic tour (#51): starting in rotation 1 with the opponent serving, it goes
 * through all six rotations (a side-out in each) and shows a held serve, lost points, a
 * free ball, a down ball, a pipe, a longer rally and the libero changing.
 */
export const TOUR: readonly TourRally[] = [
  { steps: [us('outside')], winner: 'us' }, // side-out → rotation 6
  { steps: [them('left'), us('pipe')], winner: 'us' }, // we hold our serve
  { steps: [them('free-ball'), us('middle', 'outside')], winner: 'them' }, // lost point
  { steps: [us('right', 'middle', 'outside')], winner: 'us' }, // side-out → rotation 5
  { steps: [them('down-ball'), us('outside')], winner: 'us' },
  { steps: [them('right', 'left')], winner: 'them' },
  { steps: [us('middle', 'outside')], winner: 'us' }, // → rotation 4
  { steps: [them('middle', 'left')], winner: 'them' },
  { steps: [us('outside'), them('left'), us('pipe')], winner: 'us' }, // longer rally → rotation 3
  { steps: [them('left')], winner: 'them' },
  { steps: [us('right', 'outside')], winner: 'us' }, // → rotation 2
  { steps: [them('right', 'left')], winner: 'them' },
  { steps: [us('outside')], winner: 'us' }, // → rotation 1
];

/** The tour for a system: every rally with the state it starts from. */
export function buildTour(
  system: System,
  libero: boolean,
  locale: Locale,
): { start: MatchState; rally: Rally }[] {
  let state = newMatch(ourTeam(system, 1, libero), opponentTeam(1), 'them');
  return TOUR.map((spec, i) => {
    const steps: RallyStep[] = [];
    spec.steps.forEach((step, j) => {
      const previous = steps[j - 1];
      const easy = previous?.by === 'them' && previous.attack.endsWith('-ball');
      const possible = choicesFor(state, step.by, easy) as string[];
      const pick = (step.prefer as string[]).find((c) => possible.includes(c)) ?? possible[0]!;
      steps.push({ by: step.by, attack: pick } as RallyStep);
    });
    const start = state;
    const rally = buildRally(state, { steps, winner: spec.winner }, locale, i + 1);
    state = rally.next;
    return { start, rally };
  });
}
