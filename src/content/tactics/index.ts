import { BLOCKING } from './blocking';
import { COVERAGE } from './coverage';
import { DEFENSE } from './defense';
import type { Situation, TacticsTopic } from './types';

export type { Situation, TacticsTopic } from './types';

/** Topics in tab order. */
export const TACTICS: readonly TacticsTopic[] = [BLOCKING, DEFENSE, COVERAGE];

export function findTopic(id: string | undefined): TacticsTopic | undefined {
  return TACTICS.find((topic) => topic.id === id);
}

export function findSituation(topic: TacticsTopic, id: string | undefined): Situation | undefined {
  return topic.situations.find((situation) => situation.id === id);
}
