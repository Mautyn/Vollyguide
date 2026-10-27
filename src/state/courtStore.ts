import { create } from 'zustand';
import { formationToPlayers, formationToZones, type Formation } from '../content/formations';
import { RECEIVE_5_1_ROTATIONS } from '../content/receive';
import { BASE_5_1_ROTATIONS } from '../content/rotations';
import { clampToPlayableArea } from '../domain/court';
import { ZONES } from '../domain/zones';
import type { Phase, Player, Point, Rotation, ZoneMap } from '../domain/types';

/** Phases the Court page can show. */
export type CourtPhase = Extract<Phase, 'base' | 'receive'>;

/**
 * A change of formation that the court should animate. `from` holds the positions
 * before the change; `version` increases with every change. Drags are not transitions.
 */
export interface Transition {
  version: number;
  from: Record<string, Point>;
}

interface CourtState {
  rotation: Rotation;
  phase: CourtPhase;
  /** Positions are in meters. */
  players: Player[];
  /** Which player id stands in each zone at the moment of serve. */
  serveZones: ZoneMap<string>;
  transition: Transition;
  movePlayer: (id: string, position: Point) => void;
  /** Loads a rotation in the current phase, discarding any drags. */
  setRotation: (rotation: Rotation) => void;
  /** Loads a phase in the current rotation, discarding any drags. */
  setPhase: (phase: CourtPhase) => void;
  /** Restores the current rotation and phase. */
  reset: () => void;
}

export function formationFor(rotation: Rotation, phase: CourtPhase): Formation {
  return phase === 'receive' ? RECEIVE_5_1_ROTATIONS[rotation] : BASE_5_1_ROTATIONS[rotation];
}

function positionsById(players: readonly Player[]): Record<string, Point> {
  return Object.fromEntries(players.map((p) => [p.id, p.position]));
}

function formationState(rotation: Rotation, phase: CourtPhase) {
  const formation = formationFor(rotation, phase);
  return {
    rotation,
    phase,
    players: formationToPlayers(formation),
    serveZones: formationToZones(formation),
  };
}

export const useCourtStore = create<CourtState>()((set, get) => {
  const load = (rotation: Rotation, phase: CourtPhase) =>
    set((state) => ({
      ...formationState(rotation, phase),
      transition: { version: state.transition.version + 1, from: positionsById(state.players) },
    }));

  return {
    ...formationState(1, 'base'),
    transition: { version: 0, from: {} },
    movePlayer: (id, position) =>
      set((state) => ({
        players: state.players.map((p) =>
          p.id === id ? { ...p, position: clampToPlayableArea(position) } : p,
        ),
      })),
    setRotation: (rotation) => load(rotation, get().phase),
    setPhase: (phase) => load(get().rotation, phase),
    reset: () => load(get().rotation, get().phase),
  };
});

/** Positions of the players standing in each zone, or null if a zone is unassigned. */
export function lineupFromState(
  players: readonly Player[],
  serveZones: ZoneMap<string>,
): ZoneMap<Point> | null {
  const byId = new Map(players.map((p) => [p.id, p.position]));
  const entries = ZONES.map((zone) => [zone, byId.get(serveZones[zone])] as const);
  if (entries.some(([, position]) => !position)) return null;
  return Object.fromEntries(entries) as ZoneMap<Point>;
}
