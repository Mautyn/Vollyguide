/** Translated text of a lesson; steps are in the same order as the English ones. */
export interface LessonText {
  title: string;
  summary: string;
  steps: { title: string; body: string[] }[];
}

/** Translated text of a Tactics situation; lists and captions keep the English order. */
export interface SituationText {
  title: string;
  summary: string;
  positioning: string[];
  execution: string[];
  principles: string[];
  whoIsAttacking?: string[];
  /** One per keyframe. */
  captions: string[];
}
