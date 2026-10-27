import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LIBERO_REPLACEMENT_SPOT } from '../content/libero';
import { useCourtStore } from './courtStore';
import { usePracticeStore } from './practiceStore';
import { usePreferences } from './preferences';

describe('libero switch', () => {
  beforeEach(() => {
    usePreferences.getState().setUseLibero(false);
    useCourtStore.getState().setPhase('base');
    useCourtStore.getState().setRotation(1);
    usePracticeStore.getState().setTask(1, 'base');
  });

  afterEach(() => {
    usePreferences.getState().setUseLibero(false);
    window.localStorage.clear();
  });

  it('on the court, puts L at the back-row MB’s spot and that MB on the bench', () => {
    usePreferences.getState().setUseLibero(true);
    const { players, serveZones, benchIds } = useCourtStore.getState();
    // Rotation 1: MB1 is the back-row middle, in zone 6 at (4.5, 3).
    expect(serveZones[6]).toBe('l');
    expect(players.find((p) => p.id === 'l')?.position).toEqual({ x: 4.5, y: 3 });
    expect(players.find((p) => p.id === 'mb1')?.position).toEqual(LIBERO_REPLACEMENT_SPOT);
    expect(benchIds).toEqual(['mb1']);
  });

  it('follows the back-row MB as the rotation changes', () => {
    usePreferences.getState().setUseLibero(true);
    useCourtStore.getState().setRotation(4);
    // Rotation 4: MB2 is the back-row middle, in zone 6.
    expect(useCourtStore.getState().serveZones[6]).toBe('l');
    expect(useCourtStore.getState().benchIds).toEqual(['mb2']);
  });

  it('switching off brings the MB back and removes L', () => {
    usePreferences.getState().setUseLibero(true);
    usePreferences.getState().setUseLibero(false);
    const { players, benchIds } = useCourtStore.getState();
    expect(players.some((p) => p.id === 'l')).toBe(false);
    expect(players).toHaveLength(6);
    expect(benchIds).toEqual([]);
  });

  it('in practice, makes L part of the task and grades it', () => {
    usePreferences.getState().setUseLibero(true);
    const ids = usePracticeStore.getState().players.map((p) => p.id);
    expect(ids).toContain('l');
    expect(ids).not.toContain('mb1');

    usePracticeStore.getState().showAnswer();
    usePracticeStore.getState().check();
    expect(usePracticeStore.getState().grade?.correctCount).toBe(6);
    expect(usePracticeStore.getState().grade?.legal).toBe(true);
  });
});
