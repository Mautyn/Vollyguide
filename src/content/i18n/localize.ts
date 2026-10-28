import type { Locale } from '../../i18n/locale';
import type { Formation } from '../formations';
import type { Lesson } from '../lessons';
import type { Situation, TacticsTopic } from '../tactics';
import { PL_LESSONS } from './pl/lessons';
import { PL_NOTES } from './pl/notes';
import { PL_SITUATIONS, PL_TOPICS } from './pl/tactics';

/** English content is the source; Polish text replaces it item by item, by id and position. */

export function localizeLesson(lesson: Lesson, locale: Locale): Lesson {
  const text = locale === 'pl' ? PL_LESSONS[lesson.id] : undefined;
  if (!text) return lesson;
  return {
    ...lesson,
    title: text.title,
    summary: text.summary,
    steps: lesson.steps.map((step, i) => ({
      ...step,
      title: text.steps[i]?.title ?? step.title,
      body: text.steps[i]?.body ?? step.body,
    })),
  };
}

export function localizeSituation(situation: Situation, locale: Locale): Situation {
  const text = locale === 'pl' ? PL_SITUATIONS[situation.id] : undefined;
  if (!text) return situation;
  return {
    ...situation,
    title: text.title,
    summary: text.summary,
    positioning: text.positioning,
    execution: text.execution,
    principles: text.principles,
    whoIsAttacking: text.whoIsAttacking ?? situation.whoIsAttacking,
    scene: {
      ...situation.scene,
      title: text.title,
      keyframes: situation.scene.keyframes.map((keyframe, i) => ({
        ...keyframe,
        caption: text.captions[i] ?? keyframe.caption,
      })),
    },
  };
}

export function localizeTopic(topic: TacticsTopic, locale: Locale): TacticsTopic {
  if (locale === 'en') return topic;
  return {
    ...topic,
    title: PL_TOPICS[topic.id] ?? topic.title,
    situations: topic.situations.map((s) => localizeSituation(s, locale)),
  };
}

export function localizeNote(formation: Formation, locale: Locale): string | undefined {
  if (locale === 'pl') return PL_NOTES[formation.id] ?? formation.note;
  return formation.note;
}
