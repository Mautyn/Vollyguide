import type { ScenePlayer } from '../../domain/scene';
import { OUR_TEAM } from './players';
import type { Situation, TacticsTopic } from './types';

// Shared court frame: y = 0 at our end line, net at y = 9 (comments give distance from the
// net and from our left sideline). Our attacker contacts the ball 0.7 m from the net
// (y = 8.3); the opponent's blockers jump just across the net at y = 9.5.

const opponentBlockers = (roles: { role: ScenePlayer['role']; label: string }[]): ScenePlayer[] =>
  roles.map((r, i) => ({ id: `them-b${i + 1}`, team: 'them', ...r }));

const PASS_TO_TARGET = { x: 5, y: 5 }; // the pass on its way to the setter

const outsideHitterZone4: Situation = {
  id: 'outside-hitter-attacks-zone-4',
  title: 'Outside hitter attacks from zone 4',
  summary:
    '2-3 coverage: the two players nearest the hitter cover close, the other three form a deep line.',
  keyMoment: 2,
  attacker: 'oh1',
  scene: {
    id: 'outside-hitter-attacks-zone-4',
    title: 'Outside hitter attacks from zone 4',
    // S1 comes forward from the back row (zone 1) to set; S2 is in the front row (zone 2).
    players: [
      ...OUR_TEAM,
      ...opponentBlockers([
        { role: 'OPP', label: 'OPP' },
        { role: 'MB', label: 'MB' },
      ]),
    ],
    keyframes: [
      {
        time: 0,
        positions: {
          s: { x: 7.2, y: 6.4 }, // S1 coming forward from zone 1 to set
          oh1: { x: 0.5, y: 5.8 }, // opens up 3.2 m from the net for a long approach
          mb: { x: 4, y: 6.8 }, // starts a quick approach as a decoy
          oh2: { x: 1.5, y: 4 }, // zone 5, just passed
          l: { x: 4.5, y: 3.5 }, // zone 6
          opp: { x: 8.2, y: 7.6 }, // S2, front right
          'them-b1': { x: 1.5, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
        },
        ball: { position: PASS_TO_TARGET, height: 'high' },
        caption:
          'S1 comes forward from the back row to set. Our outside hitter opens up for the approach; the middle (quick) and S2 (right side) approach as decoys.',
      },
      {
        time: 1,
        positions: {
          s: { x: 6, y: 8.2 },
          oh1: { x: 0.9, y: 7 },
          mb: { x: 4.5, y: 8.4 }, // fakes the quick
          oh2: { x: 1.5, y: 5.4 },
          l: { x: 3.6, y: 4.2 },
          opp: { x: 7.8, y: 6.6 }, // S2 fakes on the right, then drops back
          'them-b1': { x: 1.3, y: 9.5 },
          'them-b2': { x: 3.5, y: 9.5 },
        },
        ball: { position: { x: 6, y: 8.2 }, height: 'high' },
        caption:
          'S1 sets high to the outside. As soon as the ball leaves their hands, everyone moves toward the hitter.',
      },
      {
        time: 2,
        positions: {
          oh1: { x: 1.2, y: 8.3 }, // attacker
          s: { x: 2.4, y: 7 }, // close: behind and to the right, 1.8 m from the hitter
          mb: { x: 3.2, y: 7.9 }, // close: lands from the fake and turns, 2 m from the hitter
          oh2: { x: 1.5, y: 4.6 }, // deep line: left, 4.4 m from the net
          l: { x: 3.8, y: 4 }, // deep line: middle, 5 m from the net
          opp: { x: 6.3, y: 4.4 }, // deep line: right, 4.6 m from the net
          'them-b1': { x: 1, y: 9.5 },
          'them-b2': { x: 1.9, y: 9.5 },
        },
        ball: { position: { x: 1.2, y: 8.6 }, height: 'high' },
        blocking: ['them-b1', 'them-b2'],
        caption:
          'Contact. S1 and the middle are low and close to the hitter, eyes on the block; the back-row outside hitter, the libero and S2 form a deep line 4–5 m from the net.',
      },
      {
        time: 2.7,
        positions: {
          oh1: { x: 1.2, y: 8.1 },
          s: { x: 2.4, y: 7 },
          mb: { x: 3.2, y: 7.9 },
          oh2: { x: 1.5, y: 4.6 },
          l: { x: 3.8, y: 4 },
          opp: { x: 6.3, y: 4.4 },
          'them-b1': { x: 1, y: 9.5 },
          'them-b2': { x: 1.9, y: 9.5 },
        },
        ball: { position: { x: 2.2, y: 7.3 }, height: 'low' },
        blocking: ['them-b1', 'them-b2'],
        caption:
          'The block sends the ball straight back. It drops short, where S1 is already low to dig it.',
      },
    ],
  },
  positioning: [
    'Close pair (S1 and the middle blocker): about 1–2 m from the hitter, low, on both sides of the hitter’s line to the block.',
    'S1 covers behind and to the right of the hitter; the middle blocker lands from the fake and turns toward the hitter.',
    'Deep line (the back-row outside hitter, the libero, and S2, who drops off the net after a short fake on the right): about 4–5 m from the net, spread across the court for balls blocked back deep.',
  ],
  execution: [
    'Move as soon as the set is in the air, not when the hitter jumps.',
    'Arrive and stop before the contact, in a low, balanced position.',
    'Watch the opponent’s blockers’ hands, not the hitter: the ball comes back off the block.',
  ],
  principles: [
    'Go low and stop before the contact.',
    'Face the block, not the hitter.',
    'Two close, three deep.',
    'S1 always covers after setting.',
  ],
};

const oppositeZone2: Situation = {
  id: 'opposite-attacks-zone-2',
  title: 'S2 attacks from zone 2',
  summary:
    'The mirror image on the right side: S2, the front-row setter, attacks. S1, who came forward from the back row to set, and the middle cover close; the outside hitters and the libero form the deep line.',
  keyMoment: 2,
  attacker: 'opp',
  scene: {
    id: 'opposite-attacks-zone-2',
    title: 'S2 attacks from zone 2',
    // S2 in the front row attacks, so S1 comes forward from the back row (zone 1) to set.
    players: [
      ...OUR_TEAM,
      ...opponentBlockers([
        { role: 'OH', label: 'OH' },
        { role: 'MB', label: 'MB' },
      ]),
    ],
    keyframes: [
      {
        time: 0,
        positions: {
          s: { x: 7, y: 6.2 }, // coming forward from zone 1 to set
          opp: { x: 8.6, y: 5.8 }, // opens up on the right
          mb: { x: 4.5, y: 6.8 },
          oh1: { x: 1.5, y: 7.4 },
          oh2: { x: 1.5, y: 4 },
          l: { x: 4.5, y: 3.5 },
          'them-b1': { x: 7.5, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
        },
        ball: { position: PASS_TO_TARGET, height: 'high' },
        caption:
          'S1 comes forward from the back row to the target. S2 opens up on the right; the middle starts a quick approach as a decoy.',
      },
      {
        time: 1,
        positions: {
          s: { x: 6, y: 8.2 },
          opp: { x: 8.3, y: 7 },
          mb: { x: 5, y: 8.4 }, // fakes the quick
          oh1: { x: 2, y: 6.4 },
          oh2: { x: 2.3, y: 4.6 },
          l: { x: 5.6, y: 4.6 },
          'them-b1': { x: 7.6, y: 9.5 },
          'them-b2': { x: 5.6, y: 9.5 },
        },
        ball: { position: { x: 6, y: 8.2 }, height: 'high' },
        caption: 'S1 sets the right side. Everyone moves toward S2.',
      },
      {
        time: 2,
        positions: {
          opp: { x: 7.8, y: 8.3 }, // attacker
          s: { x: 6.6, y: 7 }, // close: behind and to the left, 1.8 m from the hitter
          mb: { x: 5.9, y: 7.8 }, // close: lands from the fake and turns, 2 m from the hitter
          oh1: { x: 2.6, y: 4.8 }, // deep line: left, 4.2 m from the net
          oh2: { x: 4.4, y: 3.9 }, // deep line: middle, 5.1 m from the net
          l: { x: 7.4, y: 4.4 }, // deep line: right, behind the hitter, 4.6 m from the net
          'them-b1': { x: 8.2, y: 9.5 },
          'them-b2': { x: 7.3, y: 9.5 },
        },
        ball: { position: { x: 7.8, y: 8.6 }, height: 'high' },
        blocking: ['them-b1', 'them-b2'],
        caption:
          'Contact. S1 and the middle cover close; both outside hitters and the libero form the deep line.',
      },
      {
        time: 2.7,
        positions: {
          opp: { x: 7.8, y: 8.1 },
          s: { x: 6.6, y: 7 },
          mb: { x: 5.9, y: 7.8 },
          oh1: { x: 2.6, y: 4.8 },
          oh2: { x: 4.4, y: 3.9 },
          l: { x: 7.4, y: 4.4 },
          'them-b1': { x: 8.2, y: 9.5 },
          'them-b2': { x: 7.3, y: 9.5 },
        },
        ball: { position: { x: 6.9, y: 7.2 }, height: 'low' },
        blocking: ['them-b1', 'them-b2'],
        caption: 'The ball comes back off the block and drops short, right in front of S1.',
      },
    ],
  },
  positioning: [
    'Close pair: S1 behind and to the left of the hitter, and the middle blocker inside after the fake.',
    'S1 is the right-back player who came forward to set, so the libero takes the right end of the deep line, behind the hitter.',
    'Deep line: the left-front outside hitter (dropping off the net), the back-row outside hitter and the libero, about 4–5 m from the net.',
  ],
  execution: [
    'S1 turns to the hitter right after setting and takes two steps toward them.',
    'The libero slides from the middle back to the right, behind the hitter, as soon as the set goes right.',
    'Everyone stops low before the contact and watches the block.',
  ],
  principles: [
    'Same shape as on the left side, mirrored: two close, three deep.',
    'S1 always covers after setting.',
    'Call “cover!” so the hitter knows the coverage is there and can play off the block.',
  ],
};

const middleQuickZone3: Situation = {
  id: 'middle-quick-zone-3',
  title: 'Middle blocker attacks a quick in zone 3',
  summary:
    'A quick set leaves almost no time: the two players already near the hitter cover close, the others form the deep line.',
  keyMoment: 2,
  attacker: 'mb',
  scene: {
    id: 'middle-quick-zone-3',
    title: 'Middle blocker attacks a quick in zone 3',
    players: [...OUR_TEAM, ...opponentBlockers([{ role: 'MB', label: 'MB' }])],
    keyframes: [
      {
        time: 0,
        positions: {
          s: { x: 7, y: 6.5 }, // coming forward from zone 1
          mb: { x: 4.6, y: 6 }, // already approaching for the quick
          oh1: { x: 0.8, y: 6 },
          opp: { x: 8.3, y: 6 },
          oh2: { x: 1.5, y: 4 },
          l: { x: 4.5, y: 3.5 },
          'them-b1': { x: 4.5, y: 9.5 },
        },
        ball: { position: PASS_TO_TARGET, height: 'high' },
        caption:
          'A good pass. The middle blocker is already approaching for a quick; OH1 and S2 approach as decoys.',
      },
      {
        time: 0.8,
        positions: {
          s: { x: 5.8, y: 8.2 },
          mb: { x: 4.8, y: 7.6 },
          oh1: { x: 1.5, y: 7 }, // fakes the outside
          opp: { x: 7.4, y: 6.4 }, // a short fake on the right, then drops back
          oh2: { x: 2, y: 4.2 },
          l: { x: 4.5, y: 4.4 },
          'them-b1': { x: 4.6, y: 9.5 },
        },
        ball: { position: { x: 5.8, y: 8.2 }, height: 'high' },
        caption:
          'A quick set, straight into the middle blocker’s hand. The decoys have pulled the outside blockers away.',
      },
      {
        time: 1.3,
        positions: {
          mb: { x: 4.6, y: 8.4 }, // attacker
          s: { x: 5.6, y: 7.3 }, // close: 1.5 m from the hitter
          oh1: { x: 3, y: 7.4 }, // close: turns after the fake, 1.9 m from the hitter
          oh2: { x: 2, y: 4.2 }, // deep line: left, 4.8 m from the net
          l: { x: 4.5, y: 4.4 }, // deep line: middle, 4.6 m from the net
          opp: { x: 7, y: 4.9 }, // deep line: right, 4.1 m from the net
          'them-b1': { x: 4.6, y: 9.5 },
        },
        ball: { position: { x: 4.6, y: 8.7 }, height: 'low' },
        blocking: ['them-b1'],
        caption:
          'Contact. S1 and the left-side decoy cover close; S2, the libero and the left-back form the deep line.',
      },
      {
        time: 2,
        positions: {
          mb: { x: 4.6, y: 8.2 },
          s: { x: 5.6, y: 7.3 },
          oh1: { x: 3, y: 7.4 },
          oh2: { x: 2, y: 4.2 },
          l: { x: 4.5, y: 4.4 },
          opp: { x: 7, y: 4.9 },
          'them-b1': { x: 4.6, y: 9.5 },
        },
        ball: { position: { x: 4, y: 7.5 }, height: 'low' },
        blocking: ['them-b1'],
        caption:
          'The middle blocker on the other side gets a touch; the ball drops short, to the close pair.',
      },
    ],
  },
  positioning: [
    'Close pair: S1, right next to the hitter after a short set, and the left-side outside hitter, who turns toward the middle right after the fake approach.',
    'Deep line: the left-back, the libero and S2, who makes only a short fake on the right and drops back, about 4–5 m from the net.',
  ],
  execution: [
    'There is less than a second between set and contact: decoys finish their fake and turn immediately.',
    'The close pair stands tighter than on an outside attack because the block is right in front of the hitter.',
  ],
  principles: [
    'Decoys are coverers: finish the fake, then turn and cover.',
    'Two close and tight, three deep; quick feet, low position.',
    'S1 is already close: one step and down.',
  ],
};

const pipeZone6: Situation = {
  id: 'pipe-from-zone-6',
  title: 'Back-row attack (pipe) from zone 6',
  summary:
    'A back-row outside hitter attacks from behind the attack line. S1 and the middle cover short; the other three form the deep line.',
  keyMoment: 2,
  attacker: 'oh2',
  scene: {
    id: 'pipe-from-zone-6',
    title: 'Back-row attack (pipe) from zone 6',
    players: [
      ...OUR_TEAM,
      ...opponentBlockers([
        { role: 'OH', label: 'OH' },
        { role: 'MB', label: 'MB' },
        { role: 'OPP', label: 'OPP' },
      ]),
    ],
    keyframes: [
      {
        time: 0,
        positions: {
          s: { x: 7, y: 6.5 },
          oh2: { x: 4.5, y: 2.5 }, // starts the pipe approach from deep in zone 6
          mb: { x: 4.5, y: 7 },
          oh1: { x: 0.8, y: 6 },
          opp: { x: 8.3, y: 6 },
          l: { x: 1.5, y: 4 },
          'them-b1': { x: 2.5, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
          'them-b3': { x: 6.5, y: 9.5 },
        },
        ball: { position: { x: 3.5, y: 4.5 }, height: 'high' },
        caption:
          'S1 comes forward to set. All three front-row players approach as decoys; the back-row outside hitter starts the pipe approach.',
      },
      {
        time: 1,
        positions: {
          s: { x: 5.8, y: 8.2 },
          oh2: { x: 4.5, y: 4.6 },
          mb: { x: 4.8, y: 8.4 }, // fakes the quick
          oh1: { x: 1.6, y: 7 }, // a short fake on the outside, then drops back
          opp: { x: 7.6, y: 6.4 }, // a short fake on the right, then drops back
          l: { x: 2.5, y: 4 },
          'them-b1': { x: 3.2, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
          'them-b3': { x: 5.8, y: 9.5 },
        },
        ball: { position: { x: 5.8, y: 8.2 }, height: 'high' },
        caption:
          'S1 sets behind the attack line. The decoys land and immediately get out of the hitting lane.',
      },
      {
        time: 2,
        positions: {
          oh2: { x: 4.5, y: 6.2 }, // attacker, took off behind the attack line
          s: { x: 5.6, y: 7.4 }, // close: short and to the right, out of the lane, 1.6 m from the hitter
          mb: { x: 3, y: 7.3 }, // close: short and to the left after the fake, 1.9 m from the hitter
          oh1: { x: 1.8, y: 4.6 }, // deep line: left, 4.4 m from the net
          l: { x: 3.6, y: 3.4 }, // deep line: middle, behind the hitter, 5.6 m from the net
          opp: { x: 7, y: 4.4 }, // deep line: right, 4.6 m from the net
          'them-b1': { x: 3.6, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
          'them-b3': { x: 5.4, y: 9.5 },
        },
        ball: { position: { x: 4.5, y: 6.5 }, height: 'high' },
        blocking: ['them-b1', 'them-b2', 'them-b3'],
        caption:
          'Contact 2.8 m from the net. S1 and the middle cover short beside the hitter; the outside hitter, the libero and S2 form the deep line.',
      },
      {
        time: 2.8,
        positions: {
          oh2: { x: 4.5, y: 6.6 },
          s: { x: 5.6, y: 7.4 },
          mb: { x: 3, y: 7.3 },
          oh1: { x: 1.8, y: 4.6 },
          l: { x: 3.6, y: 3.4 },
          opp: { x: 7, y: 4.4 },
          'them-b1': { x: 3.6, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
          'them-b3': { x: 5.4, y: 9.5 },
        },
        ball: { position: { x: 4, y: 4 }, height: 'low' },
        blocking: ['them-b1', 'them-b2', 'them-b3'],
        caption:
          'A triple block sends the ball back deep, behind the hitter, where the libero is waiting.',
      },
    ],
  },
  positioning: [
    'Close pair (S1 and the middle): short beside the hitter, S1 to the right and the middle to the left after the fake, both out of the hitting lane.',
    'Deep line (left-front outside hitter, libero, S2): the outside hitter and S2 make only short fakes and drop back; the libero stands deep behind the hitter.',
  ],
  execution: [
    'The pipe is hit from behind the attack line, so balls blocked back travel further: cover a little deeper than for a front-row attack.',
    'Decoys must clear the lane in front of the hitter; nobody may stand between the hitter and the net.',
  ],
  principles: [
    'Clear the lane, then cover.',
    'Two short beside the hitter, three deep behind.',
    'S1 always covers after setting.',
  ],
};

export const COVERAGE: TacticsTopic = {
  id: 'coverage',
  title: 'Coverage',
  situations: [outsideHitterZone4, oppositeZone2, middleQuickZone3, pipeZone6],
};
