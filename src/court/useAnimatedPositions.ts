import { useEffect, useState } from 'react';
import { easeInOut, interpolate, type Transition } from '../domain/interpolate';
import type { Point } from '../domain/types';

export const TRANSITION_MS = 500;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Positions to draw while players move to a new formation. Each new transition
 * animates from `transition.from` to `target`; drags (no new transition) follow
 * `target` directly. With prefers-reduced-motion players jump straight to `target`.
 */
export function useAnimatedPositions(
  target: Record<string, Point>,
  transition: Transition,
  durationMs: number = TRANSITION_MS,
): Record<string, Point> {
  const [progress, setProgress] = useState({ version: transition.version, t: 1 });
  // Don't animate a transition that happened before this component mounted.
  const [mountedVersion] = useState(transition.version);
  const { version, from } = transition;

  useEffect(() => {
    if (version === mountedVersion || prefersReducedMotion()) return;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = durationMs > 0 ? Math.min(1, (now - start) / durationMs) : 1;
      setProgress({ version, t });
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [version, mountedVersion, durationMs]);

  const isNew = progress.version !== version && version !== mountedVersion;
  const t = prefersReducedMotion() ? 1 : isNew ? 0 : progress.t;
  return t >= 1 ? target : interpolate(from, target, easeInOut(t));
}
