import type { Player, ZoneMap } from '../../domain/types';
import { findFormation } from '../catalog';
import { formationToPlayers, formationToZones, type Formation } from '../formations';
import { courtZonesRotation } from './courtZonesRotation';
import { overlapRule } from './overlapRule';
import { serveReceive51 } from './serveReceive51';
import type { Lesson, LessonCourt } from './types';

export type { Lesson, LessonCourt, LessonStep } from './types';

export const LESSONS: readonly Lesson[] = [courtZonesRotation, overlapRule, serveReceive51];

export function findLesson(id: string | undefined): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

/** The formation a lesson court shows, as one formation-shaped value. */
function courtFormation(court: LessonCourt): Formation {
  if (court.kind === 'lineup') {
    return {
      id: 'lesson-lineup',
      system: '5-1',
      rotation: 1,
      phase: 'base',
      players: court.players,
    };
  }
  const formation = findFormation(court.system, court.rotation, court.phase);
  if (!formation) {
    throw new Error(`No ${court.system} ${court.phase} formation for rotation ${court.rotation}`);
  }
  return formation;
}

/** Players (positions in meters) and zones for a lesson step's court. */
export function resolveCourt(court: LessonCourt): { players: Player[]; zones: ZoneMap<string> } {
  const formation = courtFormation(court);
  return { players: formationToPlayers(formation), zones: formationToZones(formation) };
}
