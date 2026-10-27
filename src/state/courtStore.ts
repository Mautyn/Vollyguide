import { create } from 'zustand';
import { formationToPlayers, formationToZones, type Formation } from '../content/formations';
import { findFormation, type FormationPhase } from '../content/catalog';
import { withLibero } from '../content/libero';
import { clampToPlayableArea } from '../domain/court';
import { ZONES } from '../domain/zones';
import type { Transition } from '../domain/interpolate';
import type { Player, Point, Rotation, ZoneMap } from '../domain/types';
import { usePreferences } from './preferences';

/** Phases the Court page can show. */
export type CourtPhase = FormationPhase;

interface CourtState {
  rotation: Rotation;
  phase: CourtPhase;
  /** Positions are in meters. */
  players: Player[];
  /** Which player id stands in each zone at the moment of serve. */
  serveZones: ZoneMap<string>;
  /** Players off court, e.g. the middle blocker the libero replaced. */
  benchIds: string[];
  /** Whether to draw the opponent's serving lineup (receive phase only). Not saved. */
  showOpponent: boolean;
  setShowOpponent: (show: boolean) => void;
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
  return findFormation('5-1', rotation, phase)!;
}

export function positionsById(players: readonly Player[]): Record<string, Point> {
  return Object.fromEntries(players.map((p) => [p.id, p.position]));
}

function formationState(rotation: Rotation, phase: CourtPhase) {
  const base = formationFor(rotation, phase);
  const { formation, benched } = usePreferences.getState().useLibero
    ? withLibero(base)
    : { formation: base, benched: null };
  const bench: Player[] = benched ? [{ ...benched, team: 'us' }] : [];
  return {
    rotation,
    phase,
    players: [...formationToPlayers(formation), ...bench],
    serveZones: formationToZones(formation),
    benchIds: bench.map((p) => p.id),
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
    showOpponent: false,
    setShowOpponent: (showOpponent) => set({ showOpponent }),
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

// Switching the libero on or off changes who is on court: reload the formation.
usePreferences.subscribe((prefs, previous) => {
  if (prefs.useLibero !== previous.useLibero) useCourtStore.getState().reset();
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
