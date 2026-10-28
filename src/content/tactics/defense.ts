import { OPPONENT_SETTER, OUR_READY, OUR_TEAM, opponentPair } from './players';
import type { Situation, TacticsTopic } from './types';

// Perimeter defense. Shared court frame: y = 0 at our end line, net at y = 9, so a player
// at y is (9 − y) m from the net. Blockers jump at y = 8.5 (0.5 m from the net).

/** Contact moment against an attack from the opponent's left side (our right). */
const VS_LEFT_SIDE_AT_CONTACT = {
  opp: { x: 7.8, y: 8.5 }, // blocks: sets the block on the line
  mb: { x: 6.9, y: 8.5 }, // blocks: closes next to the opposite
  oh1: { x: 1.5, y: 6 }, // off-blocker: 3 m from net, 1.5 m inside the left sideline
  s: { x: 8.3, y: 2.5 }, // line: 6.5 m from net, 0.7 m inside the right sideline
  l: { x: 5, y: 0.5 }, // middle-back: 8.5 m from net, toward the cross-court side
  oh2: { x: 1, y: 2.5 }, // cross-court: 6.5 m from net, 1 m inside the left sideline
};

const LEFT_SIDE_SET = {
  ...OUR_READY,
  opp: { x: 7.9, y: 8.4 },
  mb: { x: 6, y: 8.4 },
  oh1: { x: 1.5, y: 7.3 },
  oh2: { x: 1.2, y: 3 },
  l: { x: 4.8, y: 1.2 },
  s: { x: 8, y: 3 },
};

const vsLeftSide: Situation = {
  id: 'attack-from-left-side',
  title: 'Attack from the opponent’s left side',
  summary:
    'The opponent’s outside hitter attacks from their left side, which is our right. Our opposite and middle blocker form a double block; everyone else takes their perimeter spot.',
  keyMoment: 2,
  scene: {
    id: 'attack-from-left-side',
    title: 'Attack from the opponent’s left side',
    players: [...OUR_TEAM, ...opponentPair({ role: 'OH', label: 'OH' })],
    keyframes: [
      {
        time: 0,
        positions: { ...OUR_READY, 'them-s': OPPONENT_SETTER, 'them-attacker': { x: 8.3, y: 13 } },
        ball: { position: OPPONENT_SETTER, height: 'high' },
        caption:
          'The opponent setter takes the pass. Our blockers wait at the net, defenders in base.',
      },
      {
        time: 1.2,
        positions: {
          ...LEFT_SIDE_SET,
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8.1, y: 11.5 },
        },
        ball: { position: { x: 5.5, y: 10.6 }, height: 'high' },
        caption:
          'Set to the outside. The block moves right; the off-blocker drops off the net and the back row slides into the perimeter.',
      },
      {
        time: 2.2,
        positions: {
          ...VS_LEFT_SIDE_AT_CONTACT,
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8, y: 10.2 },
        },
        ball: { position: { x: 8, y: 10 }, height: 'high' },
        blocking: ['opp', 'mb'],
        caption:
          'Contact: double block on the right, off-blocker on the attack line, line and cross-court defenders 6.5 m from the net, middle-back deep.',
      },
      {
        time: 3,
        positions: {
          ...VS_LEFT_SIDE_AT_CONTACT,
          opp: { x: 7.8, y: 8.3 },
          mb: { x: 6.9, y: 8.3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8, y: 10.4 },
        },
        ball: { position: { x: 1.3, y: 2.9 }, height: 'low' },
        caption:
          'The attacker hits hard cross-court, past the block: the cross-court defender digs it.',
      },
    ],
  },
  positioning: [
    'Block: the opposite sets the block on the line, the middle blocker closes next to them.',
    'Off-blocker (outside hitter, left front): drops to the attack line, about 3 m from the net near the left sideline, for the sharp cross-court angle and tips.',
    'Line defender (right back): about 6.5 m from the net, just inside the right sideline, for line shots and tips over the block.',
    'Middle-back: deep, about 8.5 m from the net, toward the cross-court side, for deep balls and balls off the block.',
    'Cross-court defender (left back): about 6.5 m from the net near the left sideline, the main dig for hard cross-court hits.',
  ],
  execution: [
    'Everyone moves as soon as the set direction is clear and is stopped, low and balanced, when the attacker contacts the ball.',
    'Defenders watch the attacker’s arm, not the ball in the air.',
    'Whoever digs aims the ball high to the middle of our court, about 3 m from the net.',
  ],
  principles: [
    'Stand where the attacker can still hit past the block: sharp angle, line, over or off the block.',
    'See the attacker’s arm between or beside the blockers.',
    'Be stopped at contact: a moving defender cannot dig.',
  ],
  whoIsAttacking: [
    'Outside hitter (most common): a high ball to the left side gives the double block time to form.',
    'Opposite after a switch: rarer; treat it like an outside hitter, but expect a harder line shot.',
    'Back-row attack from the left (D-ball): it starts behind the attack line, so the block jumps later and defenders can play a step deeper.',
  ],
};

/** Contact moment against an attack from the opponent's right side (our left). */
const VS_RIGHT_SIDE_AT_CONTACT = {
  oh1: { x: 1.2, y: 8.5 }, // blocks: sets the block on the line
  mb: { x: 2.1, y: 8.5 }, // blocks: closes next to the outside hitter
  opp: { x: 7.5, y: 6 }, // off-blocker: 3 m from net, 1.5 m inside the right sideline
  oh2: { x: 0.7, y: 2.5 }, // line: 6.5 m from net, 0.7 m inside the left sideline
  l: { x: 4, y: 0.5 }, // middle-back: 8.5 m from net, toward the cross-court side
  s: { x: 8, y: 2.5 }, // cross-court: 6.5 m from net, 1 m inside the right sideline
};

const vsRightSide: Situation = {
  id: 'attack-from-right-side',
  title: 'Attack from the opponent’s right side',
  summary:
    'The mirror image: the opponent attacks from their right side, usually with their opposite. Our outside hitter and middle blocker block; the rest take mirrored perimeter spots.',
  keyMoment: 2,
  scene: {
    id: 'attack-from-right-side',
    title: 'Attack from the opponent’s right side',
    players: [...OUR_TEAM, ...opponentPair({ role: 'OPP', label: 'OPP' })],
    keyframes: [
      {
        time: 0,
        positions: { ...OUR_READY, 'them-s': OPPONENT_SETTER, 'them-attacker': { x: 0.8, y: 13 } },
        ball: { position: OPPONENT_SETTER, height: 'high' },
        caption:
          'The opponent setter takes the pass. Our blockers wait at the net, defenders in base.',
      },
      {
        time: 1,
        positions: {
          ...OUR_READY,
          oh1: { x: 1.1, y: 8.4 },
          mb: { x: 3.2, y: 8.4 },
          opp: { x: 7.5, y: 7.3 },
          oh2: { x: 1, y: 3 },
          l: { x: 4.2, y: 1.2 },
          s: { x: 7.8, y: 3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 0.9, y: 11.5 },
        },
        ball: { position: { x: 1.8, y: 10.1 }, height: 'high' },
        caption:
          'Back set to the right side. The block moves left; our opposite drops off the net and the back row mirrors the perimeter.',
      },
      {
        time: 1.9,
        positions: {
          ...VS_RIGHT_SIDE_AT_CONTACT,
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 1, y: 10.2 },
        },
        ball: { position: { x: 1, y: 10 }, height: 'high' },
        blocking: ['oh1', 'mb'],
        caption:
          'Contact: double block on the left, our opposite on the attack line, line and cross-court defenders 6.5 m from the net, middle-back deep.',
      },
      {
        time: 2.7,
        positions: {
          ...VS_RIGHT_SIDE_AT_CONTACT,
          oh1: { x: 1.2, y: 8.3 },
          mb: { x: 2.1, y: 8.3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 1, y: 10.4 },
        },
        ball: { position: { x: 7.8, y: 2.8 }, height: 'low' },
        caption:
          'A hard cross-court hit past the block: our setter, as cross-court defender, digs it.',
      },
    ],
  },
  positioning: [
    'Block: the outside hitter sets the block on the line, the middle blocker closes.',
    'Off-blocker (opposite, right front): drops to the attack line, about 3 m from the net near the right sideline.',
    'Line defender (left back): about 6.5 m from the net, just inside the left sideline.',
    'Middle-back: deep, about 8.5 m from the net, toward the cross-court side.',
    'Cross-court defender (setter, right back): about 6.5 m from the net near the right sideline.',
  ],
  execution: [
    'A back set travels a short distance: the block and defenders must read the setter early.',
    'Defenders are stopped and low at contact, watching the attacker’s arm.',
    'If the setter digs, someone else (usually the opposite) sets the second ball.',
  ],
  principles: [
    'The same perimeter as against the left side, mirrored.',
    'Stand where the attacker can still hit past the block, and see the attacker’s arm.',
    'Be stopped at contact.',
  ],
  whoIsAttacking: [
    'Opposite (most common): often the hardest hitter, so the cross-court defender plays a step deeper and the line defender stays on the line.',
    'Outside hitter on a back set: the same block, but expect more tips and angles.',
    'Middle on a slide behind the setter: fast and moving, so often only one blocker arrives; the off-blocker must pinch in for the cross-court angle.',
  ],
};

/** Contact moment against a quick attack in the middle. */
const VS_MIDDLE_AT_CONTACT = {
  mb: { x: 4.6, y: 8.5 }, // blocks alone: no time for a double block on a quick
  oh1: { x: 2, y: 6 }, // off-blocker: 3 m from net, left of the block
  opp: { x: 7, y: 6 }, // off-blocker: 3 m from net, right of the block
  oh2: { x: 1, y: 3 }, // left wing (cross-court): 6 m from net, 1 m inside the left sideline
  l: { x: 4.5, y: 0.5 }, // middle-back: 8.5 m from net, straight behind the block
  s: { x: 8, y: 3 }, // right wing (line): 6 m from net, 1 m inside the right sideline
};

const vsMiddle: Situation = {
  id: 'attack-from-middle',
  title: 'Attack from the middle',
  summary:
    'A quick attack in the middle leaves no time for a double block: our middle blocker blocks alone, both outside blockers drop off, and the back row spreads around them.',
  keyMoment: 2,
  scene: {
    id: 'attack-from-middle',
    title: 'Attack from the middle',
    players: [...OUR_TEAM, ...opponentPair({ role: 'MB', label: 'MB' })],
    keyframes: [
      {
        time: 0,
        positions: {
          ...OUR_READY,
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.6, y: 11.5 },
        },
        ball: { position: OPPONENT_SETTER, height: 'high' },
        caption:
          'The opponent’s middle blocker approaches early for a quick. Our middle blocker reads the setter, not the hitter.',
      },
      {
        time: 0.6,
        positions: {
          ...OUR_READY,
          mb: { x: 4.6, y: 8.4 },
          oh1: { x: 1.8, y: 8.4 },
          opp: { x: 7.2, y: 8.4 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.6, y: 10.2 },
        },
        ball: { position: { x: 3.6, y: 9.8 }, height: 'low' },
        caption:
          'A quick set. Our middle blocker jumps with the hitter; the outside blockers pinch in, see they are too late, and drop off.',
      },
      {
        time: 1.1,
        positions: {
          ...VS_MIDDLE_AT_CONTACT,
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.6, y: 9.8 },
        },
        ball: { position: { x: 4.6, y: 9.6 }, height: 'high' },
        blocking: ['mb'],
        caption:
          'Contact: a single block in the middle, both off-blockers on the attack line, wings 6 m from the net and the middle-back deep.',
      },
      {
        time: 1.8,
        positions: {
          ...VS_MIDDLE_AT_CONTACT,
          mb: { x: 4.6, y: 8.3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 4.6, y: 10 },
        },
        ball: { position: { x: 4.6, y: 1 }, height: 'low' },
        caption:
          'The ball touches the block and slows down: the middle-back digs it deep in the middle.',
      },
    ],
  },
  positioning: [
    'Block: the middle blocker blocks alone, in front of the hitter’s arm.',
    'Off-blockers (both outside hitters at the net): drop to the attack line, left and right of the block, for tips and short angles.',
    'Wings (left back and right back): about 6 m from the net, near the sidelines.',
    'Middle-back: deep in the middle, behind the block, for balls off the block and over it.',
  ],
  execution: [
    'Read block: the middle blocker watches the setter’s body and the pass, then commits only when the set is clear.',
    'On a slower middle ball (a pipe), the outside blockers have time to close and form a double or triple block (see Blocking).',
    'Defenders are stopped at contact; quick attacks give less than a second, so start in good positions.',
  ],
  principles: [
    'Read the setter before committing.',
    'Off-blockers cover the short ball, the back row covers the edges and the deep middle.',
    'A touch on the block is a success: it turns a hard attack into a playable ball.',
  ],
  whoIsAttacking: [
    'Middle blocker quick: no time for a double block; the middle blocks alone and the outsides drop for tips.',
    'Back-row pipe by an outside hitter: slower, so the outside blockers can close for a double or triple block.',
    'Setter dump: the middle blocker and the off-blocker on the setter’s side watch for the setter attacking the second ball.',
  ],
};

const tipOverBlock: Situation = {
  id: 'tip-over-the-block',
  title: 'Tip over the block',
  summary:
    'The attacker sees a closed block and tips the ball over it. The line defender comes forward and calls it; the off-blocker backs them up.',
  keyMoment: 2,
  scene: {
    id: 'tip-over-the-block',
    title: 'Tip over the block',
    players: [...OUR_TEAM, ...opponentPair({ role: 'OH', label: 'OH' })],
    keyframes: [
      vsLeftSide.scene.keyframes[0]!,
      vsLeftSide.scene.keyframes[1]!,
      {
        ...vsLeftSide.scene.keyframes[2]!,
        caption:
          'Contact: our double block is closed, so the attacker changes the shot and tips the ball over the block.',
      },
      {
        time: 3.4,
        positions: {
          opp: { x: 7.8, y: 8.3 },
          mb: { x: 6.9, y: 8.3 },
          s: { x: 7, y: 6.2 }, // line defender comes forward: 2.8 m from net, calls "Mine!"
          oh1: { x: 3.2, y: 6.6 }, // off-blocker backs up toward the middle
          l: { x: 5, y: 2.5 }, // middle-back moves up behind the play
          oh2: { x: 1.2, y: 3 },
          'them-s': OPPONENT_SETTER,
          'them-attacker': { x: 8, y: 10.4 },
        },
        ball: { position: { x: 6.8, y: 6.5 }, height: 'low' },
        caption:
          'The ball drops just behind the block. The line defender sprints forward, calls “Mine!” and digs it; the off-blocker backs up.',
      },
    ],
  },
  positioning: [
    'Before the contact everyone is in the perimeter, exactly as against a normal attack from the left side.',
    'A tip over the block lands 2–4 m from the net behind the blockers.',
  ],
  execution: [
    'The line defender reads the tip from the attacker’s arm slowing down, sprints forward and calls “Mine!”.',
    'The off-blocker moves toward the middle as backup, in case the tip goes further inside.',
    'The middle-back moves up to cover the space the line defender left.',
  ],
  principles: [
    'Read the arm: a slowing arm swing means a tip.',
    'The line defender owns tips behind the block and calls them early.',
    'Everyone else moves one step toward the ball as backup.',
  ],
};

export const DEFENSE: TacticsTopic = {
  id: 'defense',
  title: 'Defense',
  situations: [vsLeftSide, vsRightSide, vsMiddle, tipOverBlock],
};
