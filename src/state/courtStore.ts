import { create } from 'zustand';
import { BASE_5_1_ROTATION_1, formationToPlayers, formationToZones } from '../content/formations';
import { clampToPlayableArea } from '../domain/court';
import { ZONES } from '../domain/zones';
import type { Player, Point, ZoneMap } from '../domain/types';

interface CourtState {
  /** Positions are in meters. */
  players: Player[];
  /** Which player id stands in each zone at the moment of serve. */
  serveZones: ZoneMap<string>;
  movePlayer: (id: string, position: Point) => void;
  reset: () => void;
}

const initialPlayers = () => formationToPlayers(BASE_5_1_ROTATION_1);
const initialZones = () => formationToZones(BASE_5_1_ROTATION_1);

export const useCourtStore = create<CourtState>()((set) => ({
  players: initialPlayers(),
  serveZones: initialZones(),
  movePlayer: (id, position) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, position: clampToPlayableArea(position) } : p,
      ),
    })),
  reset: () => set({ players: initialPlayers(), serveZones: initialZones() }),
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
