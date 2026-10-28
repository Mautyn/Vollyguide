import { create } from 'zustand';
import { findFormation, type FormationPhase } from '../content/catalog';
import { formationToPlayers, formationToZones, type Formation } from '../content/formations';
import { clampToPlayableArea } from '../domain/court';
import { gradePlacement, type PlacementGrade, type TargetSpot } from '../domain/grading';
import type { Transition } from '../domain/interpolate';
import type { Player, Point, Rotation, System, ZoneMap } from '../domain/types';
import { withLibero } from '../content/libero';
import { positionsById } from './courtStore';
import { usePreferences } from './preferences';

/** Players wait on the bench left of the court before the learner places them. */
export const BENCH_X = -1.5;
const BENCH_FIRST_Y = 0.75;
const BENCH_STEP_Y = 1.5;

const ROTATIONS: readonly Rotation[] = [1, 2, 3, 4, 5, 6];
const PHASES: readonly FormationPhase[] = ['base', 'receive'];

/** The task's target formation; with the libero switch on, L replaces the back-row MB. */
export function practiceFormation(
  system: System,
  rotation: Rotation,
  phase: FormationPhase,
): Formation {
  const formation = findFormation(system, rotation, phase)!;
  return usePreferences.getState().useLibero ? withLibero(formation).formation : formation;
}

/** The formation's players in a column on the bench, in roster order. Deterministic. */
export function benchPlayers(formation: Formation): Player[] {
  return formationToPlayers(formation).map((player, i) => ({
    ...player,
    position: { x: BENCH_X, y: BENCH_FIRST_Y + i * BENCH_STEP_Y },
  }));
}

export function targetSpots(formation: Formation): TargetSpot[] {
  return formation.players.map(({ id, zone, position }) => ({ id, zone, position }));
}

/** A random task different from the current one. `random` returns a number in [0, 1). */
export function pickRandomTask(
  current: { rotation: Rotation; phase: FormationPhase },
  random: () => number = Math.random,
): { rotation: Rotation; phase: FormationPhase } {
  const tasks = ROTATIONS.flatMap((rotation) =>
    PHASES.map((phase) => ({ rotation, phase })),
  ).filter((t) => t.rotation !== current.rotation || t.phase !== current.phase);
  return tasks[Math.min(tasks.length - 1, Math.floor(random() * tasks.length))]!;
}

interface PracticeState {
  system: System;
  rotation: Rotation;
  phase: FormationPhase;
  /** Positions in meters, as placed by the learner. */
  players: Player[];
  zones: ZoneMap<string>;
  /** Result of the last check; cleared when a player moves. */
  grade: PlacementGrade | null;
  transition: Transition;
  /** Changes the system and restarts the current rotation and phase. */
  setSystem: (system: System) => void;
  setTask: (rotation: Rotation, phase: FormationPhase) => void;
  randomTask: (random?: () => number) => void;
  movePlayer: (id: string, position: Point) => void;
  check: () => void;
  showAnswer: () => void;
  tryAgain: () => void;
}

function taskState(system: System, rotation: Rotation, phase: FormationPhase) {
  const formation = practiceFormation(system, rotation, phase);
  return {
    system,
    rotation,
    phase,
    players: benchPlayers(formation),
    zones: formationToZones(formation),
    grade: null,
  };
}

export const usePracticeStore = create<PracticeState>()((set, get) => {
  const nextTransition = (state: PracticeState): Transition => ({
    version: state.transition.version + 1,
    from: positionsById(state.players),
  });

  return {
    ...taskState('5-1', 1, 'base'),
    transition: { version: 0, from: {} },
    setSystem: (system) =>
      set((state) => ({
        ...taskState(system, state.rotation, state.phase),
        transition: nextTransition(state),
      })),
    setTask: (rotation, phase) =>
      set((state) => ({
        ...taskState(state.system, rotation, phase),
        transition: nextTransition(state),
      })),
    randomTask: (random) => {
      const { rotation, phase } = pickRandomTask(get(), random);
      get().setTask(rotation, phase);
    },
    movePlayer: (id, position) =>
      set((state) => ({
        grade: null,
        players: state.players.map((p) =>
          p.id === id ? { ...p, position: clampToPlayableArea(position) } : p,
        ),
      })),
    check: () =>
      set((state) => ({
        grade: gradePlacement(
          targetSpots(practiceFormation(state.system, state.rotation, state.phase)),
          positionsById(state.players),
        ),
      })),
    showAnswer: () =>
      set((state) => ({
        grade: null,
        players: formationToPlayers(practiceFormation(state.system, state.rotation, state.phase)),
        transition: nextTransition(state),
      })),
    tryAgain: () =>
      set((state) => ({
        grade: null,
        players: benchPlayers(practiceFormation(state.system, state.rotation, state.phase)),
        transition: nextTransition(state),
      })),
  };
});

// Switching the libero on or off changes who is on court, so restart the current task.
usePreferences.subscribe((prefs, previous) => {
  if (prefs.useLibero === previous.useLibero) return;
  const { rotation, phase, setTask } = usePracticeStore.getState();
  setTask(rotation, phase);
});
