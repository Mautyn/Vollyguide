import { create } from 'zustand';
import { BASE_5_1_ROTATION_1, formationToPlayers } from '../content/formations';
import { clampToPlayableArea } from '../domain/court';
import type { Player, Point } from '../domain/types';

interface CourtState {
  /** Positions are in meters. */
  players: Player[];
  movePlayer: (id: string, position: Point) => void;
  reset: () => void;
}

const initialPlayers = () => formationToPlayers(BASE_5_1_ROTATION_1);

export const useCourtStore = create<CourtState>()((set) => ({
  players: initialPlayers(),
  movePlayer: (id, position) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id ? { ...p, position: clampToPlayableArea(position) } : p,
      ),
    })),
  reset: () => set({ players: initialPlayers() }),
}));
