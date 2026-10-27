import type { FormationPlayer } from '../formations';
import { RECEIVE_5_1_ROTATIONS } from '../receive';
import { BASE_5_1_ROTATIONS } from '../rotations';
import type { Lesson } from './types';

/** A copy of a formation's players with some positions changed. */
function moved(
  players: readonly FormationPlayer[],
  changes: Record<string, { x: number; y: number }>,
): FormationPlayer[] {
  return players.map((p) => ({ ...p, position: { ...(changes[p.id] ?? p.position) } }));
}

export const overlapRule: Lesson = {
  id: 'overlap-rule',
  title: 'The overlap rule',
  summary: 'What is checked at the moment of serve, with legal and illegal examples.',
  steps: [
    {
      title: 'When the rule applies',
      body: [
        'Positions are judged only at the moment the ball is served, by where the players’ feet are. After the serve, players may move anywhere.',
        'Each player is checked against their neighbours: the player in front or behind, and the players to the left and right.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'base' },
    },
    {
      title: 'Front against back',
      body: [
        'Each front-row player must be closer to the net than the back-row player directly behind: zone 4 in front of 5, 3 in front of 6, and 2 in front of 1.',
        'Here the opposite in zone 4 is closer to the net than the outside hitter in zone 5.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'base' },
      highlight: ['opp', 'oh2'],
    },
    {
      title: 'Left against right',
      body: [
        'Within each row the left-to-right order must be kept: 4-3-2 in the front row and 5-6-1 in the back row.',
        'Players only need to be left or right of their neighbours. They do not have to stand in a straight line.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'base' },
      highlight: ['opp', 'mb2', 'oh1'],
    },
    {
      title: 'A legal hiding spot',
      body: [
        'In serve receive the setter in zone 1 stands just behind and to the right of the right-front player in zone 2.',
        'It looks unusual, but every pair keeps its order, so the lineup is legal.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'receive' },
      highlight: ['s', 'oh1'],
    },
    {
      title: 'Illegal: the setter leaves too early',
      body: [
        'Here the setter has moved towards the net before the serve and is now closer to the net than the right-front player.',
        'That is an overlap fault between zones 2 and 1, and the referee would award the point to the serving team.',
      ],
      court: {
        kind: 'lineup',
        players: moved(RECEIVE_5_1_ROTATIONS[1].players, { s: { x: 8.5, y: 6.5 } }),
      },
      highlight: ['s', 'oh1'],
    },
    {
      title: 'Illegal: neighbours swapped',
      body: [
        'Here the left-back player in zone 5 has drifted to the right of the middle-back player in zone 6.',
        'The back row is no longer in 5-6-1 order, so this is also an overlap fault.',
      ],
      court: {
        kind: 'lineup',
        players: moved(BASE_5_1_ROTATIONS[1].players, { oh2: { x: 5.5, y: 3 } }),
      },
      highlight: ['oh2', 'mb1'],
    },
  ],
};
