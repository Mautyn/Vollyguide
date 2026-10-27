import { OPPONENT_SETTER, OUR_READY, OUR_TEAM, opponentPair } from './players';
import type { Situation, TacticsTopic } from './types';

// Shared court frame: y = 0 at our end line, net at y = 9, opponent side y > 9.
// Blockers jump at y = 8.5 (0.5 m from the net). The opponent's left side is our right.

const doubleBlockVsOutside: Situation = {
  id: 'double-block-vs-outside',
  title: 'Double block vs. an outside attack',
  summary:
    'The opponent attacks from their left side. Our right-side blocker sets the block and the middle blocker closes next to them.',
  keyMoment: 2,
  scene: {
    id: 'double-block-vs-outside',
    title: 'Double block vs. an outside attack',
    players: [...OUR_TEAM, ...opponentPair({ role: 'OH', label: 'OH' })],
    keyframes: [
      {
        time: 0,
        positions: { ...OUR_READY, 'them-s': OPPONENT_SETTER, 'them-attacker': { x: 8.3, y: 13 } },
        ball: { position: OPPONENT_SETTER, height: 'high' },
        caption:
          'The opponent setter takes the pass. Our blockers wait at the net in base position.',
      },
      {
        time: 1.2,
        positions: {
          ...OUR_READY,
          opp: { x: 7.9, y: 8.4 }, // sets the block on the line
          mb: { x: 6, y: 8.4 }, // reads the set and starts closing
          oh1: { x: 1.5, y: 7.5 }, // starts dropping off the net
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8.1, y: 11.5 },
        },
        ball: { position: { x: 5.5, y: 10.6 }, height: 'high' },
        caption:
          'The ball is set to the outside. Our right-side blocker sets the block on the line; the middle blocker crossover-steps toward them.',
      },
      {
        time: 2.2,
        positions: {
          opp: { x: 7.8, y: 8.5 },
          mb: { x: 6.9, y: 8.5 },
          oh1: { x: 1.8, y: 6 }, // off-blocker at the attack line, 3 m from the net
          oh2: { x: 1, y: 3 },
          l: { x: 5, y: 1 },
          s: { x: 8.3, y: 2.5 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8, y: 10.2 },
        },
        ball: { position: { x: 8, y: 10 }, height: 'high' },
        blocking: ['opp', 'mb'],
        caption:
          'Joint jump: both blockers press their hands over the net with no gap between them. The off-blocker has dropped to the attack line.',
      },
      {
        time: 3,
        positions: {
          opp: { x: 7.8, y: 8.5 },
          mb: { x: 6.9, y: 8.5 },
          oh1: { x: 1.8, y: 6 },
          oh2: { x: 1, y: 3 },
          l: { x: 5, y: 1 },
          s: { x: 8.3, y: 2.5 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8, y: 10.4 },
        },
        ball: { position: { x: 7.2, y: 10.8 }, height: 'low' },
        blocking: ['opp', 'mb'],
        caption: 'Stuff block: the ball drops straight down on the opponent’s side.',
      },
    ],
  },
  positioning: [
    'Right-side blocker (opposite): about 1 m inside the right sideline, lined up with the attacker’s hitting shoulder so the line is closed.',
    'Middle blocker: starts in the middle of the net and closes to the right-side blocker, ending shoulder to shoulder with them.',
    'Off-blocker (outside hitter, left front): drops off the net to the attack line, 3 m from the net, for the sharp cross-court shot and tips.',
  ],
  execution: [
    'Read the set: the middle blocker watches the setter, then the ball, and moves only when the set direction is clear.',
    'The outside blocker sets the block early; the middle uses a crossover step to arrive next to them.',
    'Both jump together, slightly after the attacker, and press their hands over the net toward the middle of the opponent court.',
  ],
  principles: [
    'The outside blocker sets the block, the middle blocker closes it.',
    'No seam: the two blockers’ inside hands are close enough that the ball cannot pass between them.',
    'Penetrate: hands over the net and angled down into the opponent court.',
  ],
};

const doubleBlockVsRightSide: Situation = {
  id: 'double-block-vs-right-side',
  title: 'Double block vs. a right-side attack',
  summary:
    'The mirror image: the opponent attacks from their right side (usually their opposite). Our left-side blocker sets the block and the middle closes.',
  keyMoment: 2,
  scene: {
    id: 'double-block-vs-right-side',
    title: 'Double block vs. a right-side attack',
    players: [...OUR_TEAM, ...opponentPair({ role: 'OPP', label: 'OPP' })],
    keyframes: [
      {
        time: 0,
        positions: { ...OUR_READY, 'them-s': OPPONENT_SETTER, 'them-attacker': { x: 0.8, y: 13 } },
        ball: { position: OPPONENT_SETTER, height: 'high' },
        caption:
          'The opponent setter takes the pass. Our blockers wait at the net in base position.',
      },
      {
        time: 1,
        positions: {
          ...OUR_READY,
          oh1: { x: 1.1, y: 8.4 }, // sets the block on the line
          mb: { x: 3.2, y: 8.4 },
          opp: { x: 7.5, y: 7.5 }, // starts dropping off the net
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 0.9, y: 11.5 },
        },
        ball: { position: { x: 1.8, y: 10.1 }, height: 'high' },
        caption:
          'The setter sets backwards to the right side. Our left-side blocker sets the block on the line; the middle blocker closes.',
      },
      {
        time: 1.9,
        positions: {
          oh1: { x: 1.2, y: 8.5 },
          mb: { x: 2.1, y: 8.5 },
          opp: { x: 7.2, y: 6 }, // off-blocker at the attack line
          oh2: { x: 0.8, y: 2.5 },
          l: { x: 4, y: 1 },
          s: { x: 7.8, y: 3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 1, y: 10.2 },
        },
        ball: { position: { x: 1, y: 10 }, height: 'high' },
        blocking: ['oh1', 'mb'],
        caption:
          'Joint jump: our outside hitter and middle blocker block together. Our opposite has dropped to the attack line for cross-court shots and tips.',
      },
      {
        time: 2.7,
        positions: {
          oh1: { x: 1.2, y: 8.5 },
          mb: { x: 2.1, y: 8.5 },
          opp: { x: 7.2, y: 6 },
          oh2: { x: 0.8, y: 2.5 },
          l: { x: 4, y: 1 },
          s: { x: 7.8, y: 3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 1, y: 10.4 },
        },
        ball: { position: { x: 1.8, y: 10.8 }, height: 'low' },
        blocking: ['oh1', 'mb'],
        caption: 'Stuff block: the ball drops straight down on the opponent’s side.',
      },
    ],
  },
  positioning: [
    'Left-side blocker (outside hitter): about 1 m inside the left sideline, lined up with the attacker’s hitting shoulder.',
    'Middle blocker: closes from the middle to the left-side blocker.',
    'Off-blocker (opposite, right front): drops to the attack line on the right for the cross-court angle and tips.',
  ],
  execution: [
    'A back set travels a short distance, so the middle blocker must read the setter’s body early.',
    'The left-side blocker sets the block; the middle closes with a crossover step.',
    'Both jump together and seal the seam between them.',
  ],
  principles: [
    'Same pattern as against the outside, mirrored.',
    'The right-side attacker is often the opponent’s strongest hitter: a closed, penetrating block matters most here.',
    'The off-blocker on the far side always drops to the attack line.',
  ],
};

const tripleBlockVsHighBall: Situation = {
  id: 'triple-block-vs-high-ball',
  title: 'Triple block vs. a high outside ball',
  summary:
    'A high, slow set to a dominant outside hitter gives all three front-row players time to block.',
  keyMoment: 2,
  scene: {
    id: 'triple-block-vs-high-ball',
    title: 'Triple block vs. a high outside ball',
    players: [...OUR_TEAM, ...opponentPair({ role: 'OH', label: 'OH' })],
    keyframes: [
      {
        time: 0,
        positions: { ...OUR_READY, 'them-s': OPPONENT_SETTER, 'them-attacker': { x: 8.3, y: 13 } },
        ball: { position: OPPONENT_SETTER, height: 'high' },
        caption: 'The pass is off the net, so the setter can only set a high ball to the outside.',
      },
      {
        time: 1.5,
        positions: {
          ...OUR_READY,
          opp: { x: 7.9, y: 8.4 },
          mb: { x: 6.3, y: 8.4 },
          oh1: { x: 3.6, y: 8.4 }, // the far blocker runs along the net
          oh2: { x: 2, y: 4.5 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8.1, y: 12 },
        },
        ball: { position: { x: 5, y: 11 }, height: 'high' },
        caption:
          'The high set gives time: the right-side blocker sets the block, the middle closes, and the far-side blocker runs along the net.',
      },
      {
        time: 2.8,
        positions: {
          opp: { x: 7.9, y: 8.5 },
          mb: { x: 7, y: 8.5 },
          oh1: { x: 6.1, y: 8.5 }, // seals the inside
          oh2: { x: 2.5, y: 5.5 }, // moves up for tips: there is no off-blocker
          l: { x: 5, y: 2 },
          s: { x: 8.2, y: 3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8, y: 10.2 },
        },
        ball: { position: { x: 8, y: 10 }, height: 'high' },
        blocking: ['opp', 'mb', 'oh1'],
        caption:
          'Triple block: the far-side blocker arrives last and seals the inside. The left-back defender moves up because nobody is left to cover tips.',
      },
      {
        time: 3.6,
        positions: {
          opp: { x: 7.9, y: 8.5 },
          mb: { x: 7, y: 8.5 },
          oh1: { x: 6.1, y: 8.5 },
          oh2: { x: 2.5, y: 5.5 },
          l: { x: 5, y: 2 },
          s: { x: 8.2, y: 3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8, y: 10.4 },
        },
        ball: { position: { x: 7, y: 10.8 }, height: 'low' },
        blocking: ['opp', 'mb', 'oh1'],
        caption: 'Three blockers close every hitting lane: the ball comes back down on their side.',
      },
    ],
  },
  positioning: [
    'Right-side blocker: sets the block on the line, as in a double block.',
    'Middle blocker: closes next to the right-side blocker.',
    'Far-side blocker (outside hitter): runs along the net and joins on the inside, sealing the cross-court angle.',
    'Back row: with no off-blocker, the left-back defender moves up toward the attack line for tips.',
  ],
  execution: [
    'Only commit to a triple block when the set is high and slow enough for the far blocker to arrive in time.',
    'The far blocker arrives last and closes on the middle blocker, not the other way round.',
    'All three jump together.',
  ],
  principles: [
    'Worth it against a dominant attacker on a high, slow set.',
    'The cost: no off-blocker for tips and more open court for the back-row defenders.',
    'A late third blocker who leaves a seam is worse than a good double block.',
  ],
};

const tripleBlockVsPipe: Situation = {
  id: 'triple-block-vs-pipe',
  title: 'Triple block vs. a back-row attack (pipe)',
  summary:
    'The opponent attacks from the back row in the middle. Our middle blocker sets the block and both outside blockers close in.',
  keyMoment: 2,
  scene: {
    id: 'triple-block-vs-pipe',
    title: 'Triple block vs. a back-row attack (pipe)',
    players: [...OUR_TEAM, ...opponentPair({ role: 'OH', label: 'OH' })],
    keyframes: [
      {
        time: 0,
        positions: {
          ...OUR_READY,
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.5, y: 15.5 },
        },
        ball: { position: OPPONENT_SETTER, height: 'high' },
        caption:
          'A back-row outside hitter starts the approach from the middle back. Our blockers stay in base position.',
      },
      {
        time: 1.2,
        positions: {
          ...OUR_READY,
          mb: { x: 4.5, y: 8.4 }, // stays in front of the attacker
          oh1: { x: 2.6, y: 8.4 },
          opp: { x: 6.4, y: 8.4 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.5, y: 13.4 },
        },
        ball: { position: { x: 3.7, y: 11.3 }, height: 'high' },
        caption:
          'The pipe is set behind the attack line. Our middle blocker stays in front of the attacker; both outside blockers close in.',
      },
      {
        time: 2.2,
        positions: {
          oh1: { x: 3.6, y: 8.5 },
          mb: { x: 4.5, y: 8.5 },
          opp: { x: 5.4, y: 8.5 },
          oh2: { x: 1.5, y: 4 },
          l: { x: 4.5, y: 1.5 },
          s: { x: 7.5, y: 4 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.5, y: 12.6 },
        },
        ball: { position: { x: 4.5, y: 12.4 }, height: 'high' },
        blocking: ['oh1', 'mb', 'opp'],
        caption:
          'Triple block in the middle: the attacker hits from 3.5 m away, so the block can wait a moment longer before jumping.',
      },
      {
        time: 3,
        positions: {
          oh1: { x: 3.6, y: 8.5 },
          mb: { x: 4.5, y: 8.5 },
          opp: { x: 5.4, y: 8.5 },
          oh2: { x: 1.5, y: 4 },
          l: { x: 4.5, y: 3 },
          s: { x: 7.5, y: 4 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.5, y: 12.4 },
        },
        ball: { position: { x: 4.5, y: 5.5 }, height: 'high' },
        blocking: ['oh1', 'mb', 'opp'],
        caption:
          'Soft block: the ball deflects high off the blockers’ hands, and our libero has time to dig it.',
      },
    ],
  },
  positioning: [
    'Middle blocker: stays in front of the attacker and sets the block.',
    'Both outside blockers: close in from the sides and join the middle blocker.',
    'Back row: spread around the block; deflections off the block are the most likely ball.',
  ],
  execution: [
    'Watch the back-row attacker’s approach, not just the setter: the pipe is set to where they jump.',
    'Because the attacker hits from behind the attack line, time the jump later than against a front-row attack.',
    'Even without a stuff block, a touch slows the ball down for the defense.',
  ],
  principles: [
    'Middle sets, outsides close.',
    'Jump later against back-row attacks.',
    'A touch is a success: it turns a hard attack into a playable ball.',
  ],
};

export const BLOCKING: TacticsTopic = {
  id: 'blocking',
  title: 'Blocking',
  situations: [
    doubleBlockVsOutside,
    doubleBlockVsRightSide,
    tripleBlockVsHighBall,
    tripleBlockVsPipe,
  ],
};
