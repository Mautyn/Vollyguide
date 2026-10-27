import type { Lesson } from './types';

export const courtZonesRotation: Lesson = {
  id: 'court-zones-rotation',
  title: 'Court, zones and rotation order',
  summary: 'The court lines, the six zones, and how a team rotates.',
  steps: [
    {
      title: 'The court',
      body: [
        'A volleyball court is 9 m wide and 18 m long. The net splits it into two 9 × 9 m halves.',
        'On each side the attack line runs 3 m from the net. It separates the front zone from the back zone.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'base' },
    },
    {
      title: 'Six zones',
      body: [
        'Each half has six zones, numbered counter-clockwise from the right back: 1 right back, 2 right front, 3 middle front, 4 left front, 5 left back, 6 middle back.',
        'The faint numbers on our side of the court show where each zone is.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'base' },
    },
    {
      title: 'Front row and back row',
      body: [
        'Zones 2, 3 and 4 form the front row; zones 1, 5 and 6 form the back row.',
        'Only front-row players may block, or attack the ball above the net from in front of the attack line.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'base' },
      highlight: ['oh1', 'mb2', 'opp'],
    },
    {
      title: 'The setter names the rotation',
      body: [
        'A rotation is named after the zone the setter stands in at the moment of serve.',
        'Here the setter is in zone 1, so this is rotation 1.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'base' },
      highlight: ['s'],
    },
    {
      title: 'Rotating clockwise',
      body: [
        'When a team wins the serve back from the opponent, every player moves one zone clockwise: 2 → 1, 1 → 6, 6 → 5, 5 → 4, 4 → 3 and 3 → 2.',
        'The setter moves from zone 1 to zone 6, so the team is now in rotation 6.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 6, phase: 'base' },
      highlight: ['s'],
    },
    {
      title: 'The rotation order',
      body: [
        'Rotating again puts the setter in zone 5. Over a set the team plays the rotations in the order 1, 6, 5, 4, 3, 2 and then back to 1.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 5, phase: 'base' },
      highlight: ['s'],
    },
  ],
};
