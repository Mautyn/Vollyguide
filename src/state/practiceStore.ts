import { create } from 'zustand';
import { findFormation, type FormationPhase } from '../content/catalog';
import { formationToPlayers, formationToZones, type Formation } from '../content/formations';
import { clampToPlayableArea } from '../domain/court';
import { gradePlacement, type PlacementGrade, type TargetSpot } from '../domain/grading';
import type { Transition } from '../domain/interpolate';
import type { Player, Point, Rotation, ZoneMap } from '../domain/types';
import { positionsById } from './courtStore';

/** Players wait on the bench left of the court before the learner places them. */
export const BENCH_X = -1.5;
const BENCH_FIRST_Y = 0.75;
const BENCH_STEP_Y = 1.5;

const ROTATIONS: readonly Rotation[] = [1, 2, 3, 4, 5, 6];
const PHASES: readonly FormationPhase[] = ['base', 'receive'];

export function practiceFormation(rotation: Rotation, phase: FormationPhase): Formation {
  return findFormation('5-1', rotation, phase)!;
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
  rotation: Rotation;
  phase: FormationPhase;
  /** Positions in meters, as placed by the learner. */
  players: Player[];
  zones: ZoneMap<string>;
  /** Result of the last check; cleared when a player moves. */
  grade: PlacementGrade | null;
  transition: Transition;
  setTask: (rotation: Rotation, phase: FormationPhase) => void;
  randomTask: (random?: () => number) => void;
  movePlayer: (id: string, position: Point) => void;
  check: () => void;
  showAnswer: () => void;
  tryAgain: () => void;
}

function taskState(rotation: Rotation, phase: FormationPhase) {
  const formation = practiceFormation(rotation, phase);
  return {
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
    ...taskState(1, 'base'),
    transition: { version: 0, from: {} },
    setTask: (rotation, phase) =>
      set((state) => ({ ...taskState(rotation, phase), transition: nextTransition(state) })),
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
          targetSpots(practiceFormation(state.rotation, state.phase)),
          positionsById(state.players),
        ),
      })),
    showAnswer: () =>
      set((state) => ({
        grade: null,
        players: formationToPlayers(practiceFormation(state.rotation, state.phase)),
        transition: nextTransition(state),
      })),
    tryAgain: () =>
      set((state) => ({
        grade: null,
        players: benchPlayers(practiceFormation(state.rotation, state.phase)),
        transition: nextTransition(state),
      })),
  };
});
