import { describe, expect, it } from 'vitest';
import { LESSONS } from '../lessons';
import { systemFormation, SYSTEMS } from '../systems';
import { TACTICS } from '../tactics';
import { localizeLesson, localizeNote, localizeSituation, localizeTopic } from './localize';
import { PL_LESSONS } from './pl/lessons';
import { PL_NOTES } from './pl/notes';
import { PL_SITUATIONS, PL_TOPICS } from './pl/tactics';

const filled = (text: string | undefined) => expect(text?.trim()).toBeTruthy();

describe.each(LESSONS.map((l) => [l.id, l] as const))('Polish lesson %s', (id, lesson) => {
  const pl = PL_LESSONS[id];

  it('exists with a title, a summary and the same steps', () => {
    expect(pl).toBeDefined();
    filled(pl!.title);
    filled(pl!.summary);
    expect(pl!.steps).toHaveLength(lesson.steps.length);
    pl!.steps.forEach((step, i) => {
      filled(step.title);
      expect(step.body).toHaveLength(lesson.steps[i]!.body.length);
      step.body.forEach(filled);
    });
  });

  it('differs from the English text', () => {
    expect(localizeLesson(lesson, 'pl').title).not.toBe(lesson.title);
  });
});

const situations = TACTICS.flatMap((t) => t.situations);

describe('Polish tactics', () => {
  it('translates every topic title', () => {
    for (const topic of TACTICS) filled(PL_TOPICS[topic.id]);
  });

  it('has unique situation ids, so the Polish texts cannot mix up situations', () => {
    const ids = situations.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(situations.map((s) => [s.id, s] as const))('translates %s completely', (id, s) => {
    const pl = PL_SITUATIONS[id];
    expect(pl).toBeDefined();
    filled(pl!.title);
    filled(pl!.summary);
    for (const key of ['positioning', 'execution', 'principles'] as const) {
      expect(pl![key], key).toHaveLength(s[key].length);
      pl![key].forEach(filled);
    }
    expect(pl!.whoIsAttacking?.length ?? 0).toBe(s.whoIsAttacking?.length ?? 0);
    pl!.whoIsAttacking?.forEach(filled);
    expect(pl!.captions).toHaveLength(s.scene.keyframes.length);
    pl!.captions.forEach(filled);
  });

  it('localizes a whole topic, captions included', () => {
    const blocking = localizeTopic(TACTICS[0]!, 'pl');
    expect(blocking.title).toBe('Blok');
    const first = blocking.situations[0]!;
    expect(first.scene.keyframes[3]!.caption).toBe(PL_SITUATIONS[first.id]!.captions[3]);
    expect(localizeSituation(situations[0]!, 'en')).toBe(situations[0]);
  });
});

describe('Polish formation notes', () => {
  const notes = SYSTEMS.flatMap((system) =>
    ([1, 2, 3, 4, 5, 6] as const).flatMap((rotation) =>
      (['serve', 'receive'] as const).map((phase) => systemFormation(system, rotation, phase)),
    ),
  );

  it.each(notes.map((f) => [f.id, f] as const))('translates %s', (id, formation) => {
    filled(PL_NOTES[id]);
    expect(localizeNote(formation, 'pl')).toBe(PL_NOTES[id]);
    expect(localizeNote(formation, 'en')).toBe(formation.note);
  });

  it('has no notes for formations that do not exist', () => {
    const ids = new Set(notes.map((f) => f.id));
    for (const id of Object.keys(PL_NOTES)) expect(ids.has(id), id).toBe(true);
  });
});
