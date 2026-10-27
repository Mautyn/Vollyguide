import { beforeEach, describe, expect, it } from 'vitest';
import { BENCH_X, pickRandomTask, usePracticeStore } from './practiceStore';

const state = () => usePracticeStore.getState();

describe('practiceStore', () => {
  beforeEach(() => state().setTask(1, 'base'));

  it('starts every task with all six players on the bench, in a fixed order', () => {
    const { players } = state();
    expect(players).toHaveLength(6);
    expect(players.every((p) => p.position.x === BENCH_X)).toBe(true);
    expect(players.map((p) => p.position.y)).toEqual([0.75, 2.25, 3.75, 5.25, 6.75, 8.25]);
  });

  it('grades the bench as 0 correct', () => {
    state().check();
    expect(state().grade?.correctCount).toBe(0);
    expect(state().grade?.legal).toBe(false);
  });

  it('grades the shown answer as 6 correct and legal', () => {
    state().showAnswer();
    state().check();
    expect(state().grade?.correctCount).toBe(6);
    expect(state().grade?.legal).toBe(true);
  });

  it('clears the result when a player moves', () => {
    state().check();
    state().movePlayer('s', { x: 7.5, y: 3 });
    expect(state().grade).toBeNull();
    state().check();
    expect(state().grade?.players.find((p) => p.id === 's')?.result).toBe('correct');
  });

  it('puts players back on the bench with Try again', () => {
    state().showAnswer();
    state().tryAgain();
    expect(state().players.every((p) => p.position.x === BENCH_X)).toBe(true);
  });

  it('animates Show answer and Try again from where players stood', () => {
    const before = state().transition.version;
    state().movePlayer('s', { x: 2, y: 2 });
    state().showAnswer();
    expect(state().transition.version).toBe(before + 1);
    expect(state().transition.from.s).toEqual({ x: 2, y: 2 });
  });

  it('grades against the selected task', () => {
    state().setTask(1, 'receive');
    state().showAnswer();
    expect(state().players.find((p) => p.id === 's')?.position).toEqual({ x: 8.5, y: 3.5 });
    state().check();
    expect(state().grade?.correctCount).toBe(6);
  });
});

describe('pickRandomTask', () => {
  it('never returns the current task and covers the other eleven', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 11; i++) {
      const task = pickRandomTask({ rotation: 1, phase: 'base' }, () => i / 11);
      expect(task).not.toEqual({ rotation: 1, phase: 'base' });
      seen.add(`${task.rotation}-${task.phase}`);
    }
    expect(seen.size).toBe(11);
  });

  it('stays in range when random returns its maximum', () => {
    expect(() => pickRandomTask({ rotation: 2, phase: 'receive' }, () => 0.999999)).not.toThrow();
  });

  it('is used by the store to change the task', () => {
    state().setTask(1, 'base');
    state().randomTask(() => 0);
    expect(state().rotation === 1 && state().phase === 'base').toBe(false);
  });
});
