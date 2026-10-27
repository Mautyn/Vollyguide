import type { Scene } from '../../domain/scene';

/** One game situation on the Tactics page: an animation plus an explanation. */
export interface Situation {
  /** URL slug. */
  id: string;
  title: string;
  summary: string;
  scene: Scene;
  /** Index of the keyframe at the decisive moment (e.g. the block), used by content checks. */
  keyMoment: number;
  /** Id of our player who attacks, for coverage situations. */
  attacker?: string;
  /** Where each player stands and why. */
  positioning: string[];
  /** What happens, step by step. */
  execution: string[];
  /** 2–4 short principles. */
  principles: string[];
}

export interface TacticsTopic {
  /** URL slug. */
  id: string;
  title: string;
  situations: Situation[];
}
