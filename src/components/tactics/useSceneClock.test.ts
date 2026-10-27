import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSceneClock } from './useSceneClock';

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: reduce && query.includes('reduce') })),
  );
}

describe('useSceneClock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    mockReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('plays on mount and advances in real time', () => {
    const { result } = renderHook(() => useSceneClock(3));
    expect(result.current.playing).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.time).toBeGreaterThan(0.9);
    expect(result.current.time).toBeLessThan(1.1);
  });

  it('stops at the end', () => {
    const { result } = renderHook(() => useSceneClock(1));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.time).toBe(1);
    expect(result.current.playing).toBe(false);
  });

  it('plays at half speed', () => {
    const { result } = renderHook(() => useSceneClock(3));
    act(() => result.current.setSpeed(0.5));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.time).toBeGreaterThan(0.4);
    expect(result.current.time).toBeLessThan(0.6);
  });

  it('pauses, seeks (which pauses) and restarts from the beginning after the end', () => {
    const { result } = renderHook(() => useSceneClock(2));
    act(() => result.current.pause());
    const paused = result.current.time;
    act(() => vi.advanceTimersByTime(500));
    expect(result.current.time).toBe(paused);

    act(() => result.current.play());
    act(() => result.current.seek(1.5));
    expect(result.current.playing).toBe(false);
    expect(result.current.time).toBe(1.5);

    act(() => result.current.seek(99));
    expect(result.current.time).toBe(2);
    act(() => result.current.play());
    expect(result.current.time).toBe(0);
    expect(result.current.playing).toBe(true);
  });

  it('does not auto-play when the user prefers reduced motion', () => {
    mockReducedMotion(true);
    const { result } = renderHook(() => useSceneClock(3));
    expect(result.current.playing).toBe(false);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.time).toBe(0);
  });
});
