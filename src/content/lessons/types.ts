import type { Rotation, System } from '../../domain/types';
import type { FormationPhase } from '../catalog';
import type { FormationPlayer } from '../formations';

/** What the court shows in a lesson step. */
export type LessonCourt =
  /** An existing formation. Prefer this. */
  | { kind: 'formation'; system: System; rotation: Rotation; phase: FormationPhase }
  /** Explicit positions, for lineups that are not real formations (e.g. an illegal example). */
  | { kind: 'lineup'; players: FormationPlayer[] };

export interface LessonStep {
  title: string;
  /** Plain-text paragraphs. */
  body: string[];
  court: LessonCourt;
  /** Player ids to emphasise on the court. */
  highlight?: string[];
}

export interface Lesson {
  /** URL slug. */
  id: string;
  title: string;
  summary: string;
  steps: LessonStep[];
}
