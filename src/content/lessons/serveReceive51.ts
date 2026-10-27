import { RECEIVE_5_1_ROTATIONS } from '../receive';
import { ROTATION_ORDER } from '../rotations';
import type { Lesson, LessonStep } from './types';

const rotationSteps: LessonStep[] = ROTATION_ORDER.map((rotation) => ({
  title: `Rotation ${rotation}`,
  body: [RECEIVE_5_1_ROTATIONS[rotation].note ?? ''],
  court: { kind: 'formation', system: '5-1', rotation, phase: 'receive' },
  highlight: ['s'],
}));

export const serveReceive51: Lesson = {
  id: '5-1-serve-receive',
  title: '5-1 serve receive',
  summary: 'Where every player stands to receive serve, in all six rotations.',
  steps: [
    {
      title: 'Three passers',
      body: [
        'In a 5-1 system three players pass the serve: both outside hitters and the middle blocker who is in the back row.',
        'They stand in a line about 4 m from the end line, one in each lane. Everyone else stays out of their way while still keeping the overlap rule.',
      ],
      court: { kind: 'formation', system: '5-1', rotation: 1, phase: 'receive' },
      highlight: ['oh1', 'oh2', 'mb1'],
    },
    ...rotationSteps,
  ],
};
