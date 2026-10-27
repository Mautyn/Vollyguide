import { create } from 'zustand';
import { formationToPlayers, formationToZones } from '../content/formations';
import { BASE_5_1_ROTATIONS } from '../content/rotations';
import { clampToPlayableArea } from '../domain/court';
import { ZONES } from '../domain/zones';
import type { Player, Point, Rotation, ZoneMap } from '../domain/types';

interface CourtState {
  rotation: Rotation;
  /** Positions are in meters. */
  players: Player[];
  /** Which player id stands in each zone at the moment of serve. */
  serveZones: ZoneMap<string>;
  movePlayer: (id: string, position: Point) => void;
  /** Loads a rotation's base positions, discarding any drags. */
  setRotation: (rotation: Rotation) => void;
  /** Restores the current rotation's base positions. */
  reset: () => void;
}

function rotationState(rotation: Rotation) {
  const formation = BASE_5_1_ROTATIONS[rotation];
  return {
    rotation,
    players: formationToPlayers(formation),
    serveZones: formationToZones(formation),
  };
}

export const useCourtStore = create<CourtState>()((set, get) => ({
  ...rotationState(1),
  movePlayer: (id, position) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, position: clampToPlayableArea(position) } : p,
      ),
    })),
  setRotation: (rotation) => set(rotationState(rotation)),
  reset: () => set(rotationState(get().rotation)),
}));

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
