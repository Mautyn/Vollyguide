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
    'Standard 3-2 coverage: three players form a close cup around the hitter, two fill the seams behind them.',
  keyMoment: 2,
  attacker: 'oh1',
  scene: {
    id: 'outside-hitter-attacks-zone-4',
    title: 'Outside hitter attacks from zone 4',
    // Setter in the front row (zone 2), so the opposite is in the back row (zone 1).
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
          s: { x: 6.5, y: 8.3 }, // at the target, 0.7 m from the net
          oh1: { x: 0.5, y: 5.8 }, // opens up 3.2 m from the net for a long approach
          mb: { x: 4, y: 6.8 }, // starts a quick approach as a decoy
          oh2: { x: 1.5, y: 4 }, // zone 5, just passed
          l: { x: 4.5, y: 3.5 }, // zone 6
          opp: { x: 7.5, y: 4 }, // zone 1
          'them-b1': { x: 1.5, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
        },
        ball: { position: PASS_TO_TARGET, height: 'high' },
        caption:
          'The pass goes to the setter. Our outside hitter opens up for the approach; the middle starts a quick approach as a decoy.',
      },
      {
        time: 1,
        positions: {
          s: { x: 6, y: 8.2 },
          oh1: { x: 0.9, y: 7 },
          mb: { x: 4.5, y: 8.4 }, // fakes the quick
          oh2: { x: 1.5, y: 5.4 },
          l: { x: 3.6, y: 4.2 },
          opp: { x: 6.5, y: 4.4 },
          'them-b1': { x: 1.3, y: 9.5 },
          'them-b2': { x: 3.5, y: 9.5 },
        },
        ball: { position: { x: 6, y: 8.2 }, height: 'high' },
        caption:
          'The setter sets high to the outside. As soon as the ball leaves their hands, everyone moves toward the hitter.',
      },
      {
        time: 2,
        positions: {
          oh1: { x: 1.2, y: 8.3 }, // attacker
          oh2: { x: 1.3, y: 6.6 }, // inner ring: close behind, 1.7 m from the hitter (2.4 m from net)
          s: { x: 2.4, y: 7 }, // inner ring: behind and to the right, 1.8 m from the hitter
          mb: { x: 3.1, y: 8 }, // inner ring: lands from the fake and turns, 1.9 m from the hitter
          l: { x: 3.2, y: 4.6 }, // outer ring: 4.4 m from the net, middle seam
          opp: { x: 6, y: 4.2 }, // outer ring: 4.8 m from the net, right seam
          'them-b1': { x: 1, y: 9.5 },
          'them-b2': { x: 1.9, y: 9.5 },
        },
        ball: { position: { x: 1.2, y: 8.6 }, height: 'high' },
        blocking: ['them-b1', 'them-b2'],
        caption:
          'Contact. The inner ring of three is low and close around the hitter, eyes on the block; the outer ring of two fills the seams deeper.',
      },
      {
        time: 2.7,
        positions: {
          oh1: { x: 1.2, y: 8.1 },
          oh2: { x: 1.3, y: 6.6 },
          s: { x: 2.4, y: 7 },
          mb: { x: 3.1, y: 8 },
          l: { x: 3.2, y: 4.6 },
          opp: { x: 6, y: 4.2 },
          'them-b1': { x: 1, y: 9.5 },
          'them-b2': { x: 1.9, y: 9.5 },
        },
        ball: { position: { x: 2.2, y: 7.3 }, height: 'low' },
        blocking: ['them-b1', 'them-b2'],
        caption:
          'The block sends the ball straight back. It drops into the cup, where the setter is already low to dig it.',
      },
    ],
  },
  positioning: [
    'Inner ring (setter, middle blocker, left-back): about 1–2 m from the hitter, low, forming a half-circle around them.',
    'The setter covers behind and to the right of the hitter; the middle blocker lands from the fake and turns toward the hitter; the left-back comes up close behind.',
    'Outer ring (middle-back and right-back): about 4–5 m from the net, in the seams between the inner-ring players.',
  ],
  execution: [
    'Move as soon as the set is in the air, not when the hitter jumps.',
    'Arrive and stop before the contact, in a low, balanced position.',
    'Watch the opponent’s blockers’ hands, not the hitter: the ball comes back off the block.',
  ],
  principles: [
    'Go low and stop before the contact.',
    'Face the block, not the hitter.',
    'Inner ring close, outer ring fills the seams.',
    'The setter always covers after setting.',
  ],
};

const oppositeZone2: Situation = {
  id: 'opposite-attacks-zone-2',
  title: 'Opposite attacks from zone 2',
  summary:
    'The mirror image on the right side. The setter, who came forward from the back row to set, covers on the hitter’s left.',
  keyMoment: 2,
  attacker: 'opp',
  scene: {
    id: 'opposite-attacks-zone-2',
    title: 'Opposite attacks from zone 2',
    // Opposite in the front row, so the setter comes forward from the back row (zone 1).
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
          'The setter comes forward from the back row to the target. The opposite opens up on the right; the middle starts a quick approach as a decoy.',
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
        caption: 'The setter sets the right side. Everyone moves toward the opposite.',
      },
      {
        time: 2,
        positions: {
          opp: { x: 7.8, y: 8.3 }, // attacker
          s: { x: 6.6, y: 7 }, // inner ring: behind and to the left, 1.8 m from the hitter
          mb: { x: 5.9, y: 8.2 }, // inner ring: lands from the fake, 1.9 m from the hitter
          l: { x: 7.7, y: 6.6 }, // inner ring: close behind, 1.7 m from the hitter
          oh1: { x: 3.8, y: 5.2 }, // outer ring: 3.8 m from the net, left seam
          oh2: { x: 6.2, y: 4 }, // outer ring: 5 m from the net, right seam
          'them-b1': { x: 8.2, y: 9.5 },
          'them-b2': { x: 7.3, y: 9.5 },
        },
        ball: { position: { x: 7.8, y: 8.6 }, height: 'high' },
        blocking: ['them-b1', 'them-b2'],
        caption:
          'Contact. Setter, middle and libero form the inner ring; the outside hitters fill the seams behind them.',
      },
      {
        time: 2.7,
        positions: {
          opp: { x: 7.8, y: 8.1 },
          s: { x: 6.6, y: 7 },
          mb: { x: 5.9, y: 8.2 },
          l: { x: 7.7, y: 6.6 },
          oh1: { x: 3.8, y: 5.2 },
          oh2: { x: 6.2, y: 4 },
          'them-b1': { x: 8.2, y: 9.5 },
          'them-b2': { x: 7.3, y: 9.5 },
        },
        ball: { position: { x: 6.9, y: 7.2 }, height: 'low' },
        blocking: ['them-b1', 'them-b2'],
        caption:
          'The ball comes back off the block, into the cup between the setter and the libero.',
      },
    ],
  },
  positioning: [
    'Inner ring: the setter behind and to the left of the hitter, the middle blocker inside after the fake, and the libero close behind.',
    'Here the setter is the right-back player who came forward to set, so the libero (middle back) takes the close-behind spot.',
    'Outer ring: both outside hitters, about 4–5 m from the net, filling the seams.',
  ],
  execution: [
    'The setter turns to the hitter right after setting and takes two steps toward them.',
    'The libero moves up from the middle back as soon as the set goes right.',
    'Everyone stops low before the contact and watches the block.',
  ],
  principles: [
    'Same shape as on the left side, mirrored.',
    'The setter always covers after setting.',
    'Call “cover!” so the hitter knows the cup is there and can play off the block.',
  ],
};

const middleQuickZone3: Situation = {
  id: 'middle-quick-zone-3',
  title: 'Middle blocker attacks a quick in zone 3',
  summary:
    'A quick set leaves almost no time, so the coverage is tighter and is made by the players already near the net.',
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
          'A good pass. The middle blocker is already approaching for a quick; both outside hitters approach as decoys.',
      },
      {
        time: 0.8,
        positions: {
          s: { x: 5.8, y: 8.2 },
          mb: { x: 4.8, y: 7.6 },
          oh1: { x: 1.5, y: 7 }, // fakes the outside
          opp: { x: 7.6, y: 7 }, // fakes the right side
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
          s: { x: 5.6, y: 7.3 }, // inner ring: 1.5 m from the hitter
          oh1: { x: 3, y: 7.4 }, // inner ring: turns after the fake, 1.9 m from the hitter
          opp: { x: 6.6, y: 7.6 }, // inner ring: turns after the fake, 2.2 m from the hitter
          l: { x: 4.5, y: 4.8 }, // outer ring: 4.2 m from the net
          oh2: { x: 2.2, y: 4.2 }, // outer ring: 4.8 m from the net
          'them-b1': { x: 4.6, y: 9.5 },
        },
        ball: { position: { x: 4.6, y: 8.7 }, height: 'low' },
        blocking: ['them-b1'],
        caption:
          'Contact. The setter and both decoys turn into a tight cup; the libero and left-back stay deeper.',
      },
      {
        time: 2,
        positions: {
          mb: { x: 4.6, y: 8.2 },
          s: { x: 5.6, y: 7.3 },
          oh1: { x: 3, y: 7.4 },
          opp: { x: 6.6, y: 7.6 },
          l: { x: 4.5, y: 4.8 },
          oh2: { x: 2.2, y: 4.2 },
          'them-b1': { x: 4.6, y: 9.5 },
        },
        ball: { position: { x: 4, y: 7.5 }, height: 'low' },
        blocking: ['them-b1'],
        caption: 'The middle blocker on the other side gets a touch; the ball falls into the cup.',
      },
    ],
  },
  positioning: [
    'Inner ring: the setter, right next to the hitter after a short set, and both outside hitters, who turn toward the middle right after their fake approaches.',
    'Outer ring: the libero and the left-back, about 4–5 m from the net.',
  ],
  execution: [
    'There is less than a second between set and contact: decoys finish their fake and turn immediately.',
    'The cup is tighter than on an outside attack because the block is right in front of the hitter.',
  ],
  principles: [
    'Decoys are coverers: finish the fake, then turn and cover.',
    'Tight cup, quick feet, low position.',
    'The setter is already close: one step and down.',
  ],
};

const pipeZone6: Situation = {
  id: 'pipe-from-zone-6',
  title: 'Back-row attack (pipe) from zone 6',
  summary:
    'A back-row outside hitter attacks from behind the attack line. The front-row decoys turn and cover short; the others cover deep.',
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
          'The setter comes forward to set. All three front-row players approach as decoys; the back-row outside hitter starts the pipe approach.',
      },
      {
        time: 1,
        positions: {
          s: { x: 5.8, y: 8.2 },
          oh2: { x: 4.5, y: 4.6 },
          mb: { x: 4.8, y: 8.4 }, // fakes the quick
          oh1: { x: 1.5, y: 7.6 }, // fakes the outside
          opp: { x: 7.5, y: 7.6 }, // fakes the right side
          l: { x: 2.5, y: 4 },
          'them-b1': { x: 3.2, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
          'them-b3': { x: 5.8, y: 9.5 },
        },
        ball: { position: { x: 5.8, y: 8.2 }, height: 'high' },
        caption:
          'The setter sets behind the attack line. The decoys land and immediately get out of the hitting lane.',
      },
      {
        time: 2,
        positions: {
          oh2: { x: 4.5, y: 6.2 }, // attacker, took off behind the attack line
          mb: { x: 6.3, y: 7.4 }, // inner ring, short: out of the lane, 2.2 m from the hitter
          oh1: { x: 2.8, y: 7.2 }, // inner ring, short: 2 m from the hitter
          s: { x: 5.6, y: 4.9 }, // inner ring: behind and to the right, 1.7 m from the hitter
          opp: { x: 7.6, y: 5.4 }, // outer: 3.6 m from the net, right side
          l: { x: 2.8, y: 3.2 }, // outer: deep, 5.8 m from the net
          'them-b1': { x: 3.6, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
          'them-b3': { x: 5.4, y: 9.5 },
        },
        ball: { position: { x: 4.5, y: 6.5 }, height: 'high' },
        blocking: ['them-b1', 'them-b2', 'them-b3'],
        caption:
          'Contact 2.8 m from the net. The front-row decoys cover short beside the hitter, the setter covers behind, and the rest cover deep.',
      },
      {
        time: 2.8,
        positions: {
          oh2: { x: 4.5, y: 6.6 },
          mb: { x: 6.3, y: 7.4 },
          oh1: { x: 2.8, y: 7.2 },
          s: { x: 5.6, y: 4.9 },
          opp: { x: 7.6, y: 5.4 },
          l: { x: 2.8, y: 3.2 },
          'them-b1': { x: 3.6, y: 9.5 },
          'them-b2': { x: 4.5, y: 9.5 },
          'them-b3': { x: 5.4, y: 9.5 },
        },
        ball: { position: { x: 5, y: 5.3 }, height: 'low' },
        blocking: ['them-b1', 'them-b2', 'them-b3'],
        caption:
          'A triple block sends the ball back deep, behind the hitter, where the setter is waiting.',
      },
    ],
  },
  positioning: [
    'Front-row decoys (outside hitter and middle): land from their fakes and step sideways out of the hitting lane, staying short beside the hitter.',
    'Setter: behind and to the right of the hitter, covering the ball blocked back deep.',
    'Opposite and libero: the second layer, filling the right side and the deep left.',
  ],
  execution: [
    'The pipe is hit from behind the attack line, so balls blocked back travel further: cover a little deeper than for a front-row attack.',
    'Decoys must clear the lane in front of the hitter; nobody may stand between the hitter and the net.',
  ],
  principles: [
    'Clear the lane, then cover.',
    'Short cover beside the hitter, deep cover behind.',
    'The setter always covers after setting.',
  ],
};

export const COVERAGE: TacticsTopic = {
  id: 'coverage',
  title: 'Coverage',
  situations: [outsideHitterZone4, oppositeZone2, middleQuickZone3, pipeZone6],
};
