import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useCourtStore } from './courtStore';
import { usePracticeStore } from './practiceStore';
import { usePreferences } from './preferences';

describe('system switch', () => {
  beforeEach(() => {
    usePreferences.getState().setUseLibero(false);
    useCourtStore.getState().setSystem('5-1');
    useCourtStore.getState().setPhase('base');
    useCourtStore.getState().setRotation(1);
    usePracticeStore.getState().setSystem('5-1');
    usePracticeStore.getState().setTask(1, 'base');
  });

  afterEach(() => {
    useCourtStore.getState().setSystem('5-1');
    usePracticeStore.getState().setSystem('5-1');
    usePreferences.getState().setUseLibero(false);
    window.localStorage.clear();
  });

  it('starts at 5-1', () => {
    expect(useCourtStore.getState().system).toBe('5-1');
    expect(usePracticeStore.getState().system).toBe('5-1');
  });

  it('keeps rotation, phase and libero when the system changes on the court', () => {
    usePreferences.getState().setUseLibero(true);
    useCourtStore.getState().setRotation(4);
    useCourtStore.getState().setPhase('receive');
    useCourtStore.getState().setSystem('6-2');

    const { system, rotation, phase, players, serveZones } = useCourtStore.getState();
    expect([system, rotation, phase]).toEqual(['6-2', 4, 'receive']);
    expect(players.some((p) => p.id === 'l')).toBe(true);
    // 6-2 rotation 4: S2 is the back-row setter, in zone 1.
    expect(serveZones[1]).toBe('s2');
  });

  it('shows two setters and no opposite in 6-2 and 4-2', () => {
    for (const system of ['6-2', '4-2'] as const) {
      useCourtStore.getState().setSystem(system);
      const roles = useCourtStore.getState().players.map((p) => p.role);
      expect(roles.filter((r) => r === 'S')).toHaveLength(2);
      expect(roles).not.toContain('OPP');
    }
  });

  it('grades a 4-2 practice task', () => {
    usePracticeStore.getState().setSystem('4-2');
    usePracticeStore.getState().setTask(1, 'receive');
    expect(usePracticeStore.getState().system).toBe('4-2');

    usePracticeStore.getState().showAnswer();
    usePracticeStore.getState().check();
    expect(usePracticeStore.getState().grade?.correctCount).toBe(6);
    expect(usePracticeStore.getState().grade?.legal).toBe(true);
  });

  it('keeps the system for a random practice task', () => {
    usePracticeStore.getState().setSystem('6-2');
    usePracticeStore.getState().randomTask(() => 0.5);
    expect(usePracticeStore.getState().system).toBe('6-2');
  });
});
