import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Point } from '../domain/types';
import type { Transition } from '../state/courtStore';
import { useAnimatedPositions } from './useAnimatedPositions';

const start = { s: { x: 7.5, y: 3 } };
const end = { s: { x: 8.5, y: 4 } };

interface Props {
  target: Record<string, Point>;
  transition: Transition;
}

function setup() {
  return renderHook(({ target, transition }: Props) => useAnimatedPositions(target, transition), {
    initialProps: { target: start, transition: { version: 0, from: {} } },
  });
}

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: reduce && query.includes('reduce') })),
  );
}

describe('useAnimatedPositions', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
    mockReducedMotion(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows the target when nothing changed', () => {
    const { result } = setup();
    expect(result.current).toEqual(start);
  });

  it('animates a new transition from the old positions to the target over 500 ms', () => {
    const { result, rerender } = setup();
    rerender({ target: end, transition: { version: 1, from: start } });
    expect(result.current).toEqual(start);

    // Halfway through, the eased position is near the middle (frames fire every ~16 ms).
    act(() => vi.advanceTimersByTime(250));
    expect(Math.abs(result.current.s!.x - 8)).toBeLessThan(0.15);
    expect(Math.abs(result.current.s!.y - 3.5)).toBeLessThan(0.15);

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toEqual(end);
  });

  it('follows drags directly, without animating', () => {
    const { result, rerender } = setup();
    rerender({ target: end, transition: { version: 0, from: {} } });
    expect(result.current).toEqual(end);
  });

  it('jumps straight to the target when the user prefers reduced motion', () => {
    mockReducedMotion(true);
    const { result, rerender } = setup();
    rerender({ target: end, transition: { version: 1, from: start } });
    expect(result.current).toEqual(end);
  });

  it('does not replay a transition that happened before mounting', () => {
    const { result } = renderHook(() => useAnimatedPositions(end, { version: 3, from: start }));
    expect(result.current).toEqual(end);
  });
});
