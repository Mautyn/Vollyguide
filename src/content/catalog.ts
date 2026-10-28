import type { Phase, Rotation, System } from '../domain/types';
import type { Formation } from './formations';
import { systemFormation } from './systems';

/** Phases that have formations in the content. */
export type FormationPhase = Extract<Phase, 'base' | 'receive'>;

/** Looks up a formation, or undefined if the content has none for it. */
export function findFormation(
  system: System,
  rotation: Rotation,
  phase: FormationPhase,
): Formation | undefined {
  return systemFormation(system, rotation, phase);
}
