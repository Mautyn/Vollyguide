import type { Locale } from '../../i18n/locale';
import { PL_SIM_CAPTIONS } from '../i18n/pl/simulation';
import type { AttackOption } from './positions';

/**
 * Caption builders for rally scenes. `who` is a player as shown in the caption, already
 * marked as ours or theirs (see `who`). English is the source; Polish lives in
 * src/content/i18n/pl/simulation.ts and has exactly the same shape.
 */
export interface SimCaptions {
  who: (label: string, ours: boolean) => string;
  serve: (server: string) => string;
  pass: (receivingOurs: boolean) => string;
  switched: (servingOurs: boolean) => string;
  set: (setter: string, attacker: string, option: AttackOption) => string;
  attack: (attacker: string, defendingOurs: boolean, blockers: number) => string;
  dig: (ours: boolean) => string;
  freeBall: (sendingOurs: boolean) => string;
  downBall: (sendingOurs: boolean) => string;
  point: (winnerOurs: boolean, us: number, them: number) => string;
  sideOut: (ours: boolean, rotation: number) => string;
  server: (who: string, again: boolean) => string;
  liberoIn: (middle: string) => string;
  liberoOut: (middle: string) => string;
}

const OPTION: Record<AttackOption, string> = {
  outside: 'an outside attack from zone 4',
  middle: 'a quick in the middle',
  right: 'a right-side attack from zone 2',
  pipe: 'a back-row attack (pipe)',
};

export const EN_SIM_CAPTIONS: SimCaptions = {
  who: (label, ours) => (ours ? label : `their ${label}`),
  serve: (server) => `${server} serves from behind the end line.`,
  pass: (ours) => (ours ? 'We pass to the setter.' : 'They pass to their setter.'),
  switched: (ours) =>
    ours ? 'We switch to our defensive spots.' : 'They switch to their defensive spots.',
  set: (setter, attacker, option) => `${setter} sets ${attacker}: ${OPTION[option]}.`,
  attack: (attacker, ours, blockers) =>
    `${attacker} attacks. ${ours ? 'We' : 'They'} ${
      blockers === 2 ? 'double-block' : 'block with the middle'
    } and defend behind the block; the attacking team covers 2-3 (two close, three deep).`,
  dig: (ours) =>
    ours
      ? 'We dig. Blockers step off the net to approach; the setter runs to the setting spot.'
      : 'They dig and set up their counter-attack.',
  freeBall: (sendingOurs) =>
    sendingOurs
      ? 'We can only send an easy ball over; they set up to pass it.'
      : 'They can only send a free ball: our front row drops to the attack line, the setter releases and the back row passes.',
  downBall: (sendingOurs) =>
    sendingOurs
      ? 'We attack standing (down ball); they stay at the net without jumping.'
      : 'They attack standing (down ball): our blockers stay at the net without jumping and the back row steps deeper.',
  point: (ours, us, them) => `Point for ${ours ? 'us' : 'them'}: ${us}–${them}.`,
  sideOut: (ours, rotation) =>
    ours ? `Side-out: we rotate to rotation ${rotation}.` : 'Side-out for them: they rotate.',
  server: (who, again) => (again ? `${who} serves again.` : `${who} serves next.`),
  liberoIn: (middle) => `The libero comes in for ${middle}.`,
  liberoOut: (middle) => `${middle} comes back on for the libero.`,
};

export function simCaptions(locale: Locale): SimCaptions {
  return locale === 'pl' ? PL_SIM_CAPTIONS : EN_SIM_CAPTIONS;
}
