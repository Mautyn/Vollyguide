import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Transition } from '../domain/interpolate';
import type { Point } from '../domain/types';

import { useAnimatedPositions } from './useAnimatedPositions';

const start = { s: { x: 7.5, y: 3 } };
const end = { s: { x: 8.5, y: 4 } };

interface Props {
  target: Record<string, Point>;
  transition: Transition;
}

function setup() {
  return renderHook(
    ({ target, transition }: Props) => useAnimatedPositions(target, transition).positions,
    {
      initialProps: { target: start, transition: { version: 0, from: {} } },
    },
  );
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
    const { result } = renderHook(
      () => useAnimatedPositions(end, { version: 3, from: start }).positions,
    );
    expect(result.current).toEqual(end);
  });

  it('finish() ends a running animation at once, so a dragged player follows the pointer', () => {
    const { result, rerender } = renderHook(
      ({ target, transition }: Props) => useAnimatedPositions(target, transition),
      { initialProps: { target: start, transition: { version: 0, from: {} } } },
    );
    rerender({ target: end, transition: { version: 1, from: start } });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.positions).not.toEqual(end);

    act(() => result.current.finish());
    expect(result.current.positions).toEqual(end);

    // A drag moves the target: the player is drawn exactly there, with no animation left.
    const dragged = { s: { x: 5, y: 5 } };
    rerender({ target: dragged, transition: { version: 1, from: start } });
    expect(result.current.positions).toEqual(dragged);
    act(() => vi.advanceTimersByTime(600));
    expect(result.current.positions).toEqual(dragged);
  });

  it('animates the next transition normally after finish()', () => {
    const { result, rerender } = renderHook(
      ({ target, transition }: Props) => useAnimatedPositions(target, transition),
      { initialProps: { target: start, transition: { version: 0, from: {} } } },
    );
    rerender({ target: end, transition: { version: 1, from: start } });
    act(() => result.current.finish());
    rerender({ target: start, transition: { version: 2, from: end } });
    expect(result.current.positions).toEqual(end);
    act(() => vi.advanceTimersByTime(600));
    expect(result.current.positions).toEqual(start);
  });
});
