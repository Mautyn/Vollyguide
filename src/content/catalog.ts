import type { Phase, Rotation, System } from '../domain/types';
import type { Formation } from './formations';
import { RECEIVE_5_1_ROTATIONS } from './receive';
import { BASE_5_1_ROTATIONS } from './rotations';

/** Phases that have formations in the content. */
export type FormationPhase = Extract<Phase, 'base' | 'receive'>;

/** Looks up a formation, or undefined if the content has none for it. */
export function findFormation(
  system: System,
  rotation: Rotation,
  phase: FormationPhase,
): Formation | undefined {
  if (system !== '5-1') return undefined;
  return phase === 'receive' ? RECEIVE_5_1_ROTATIONS[rotation] : BASE_5_1_ROTATIONS[rotation];
}
