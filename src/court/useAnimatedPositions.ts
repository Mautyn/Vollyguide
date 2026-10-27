import { useCallback, useEffect, useRef, useState } from 'react';
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
 *
 * `finish()` ends a running animation at once. Call it when the user grabs a player:
 * otherwise the animation keeps redrawing that player at in-between positions,
 * fighting the drag, and the drop lands in the wrong place.
 */
export function useAnimatedPositions(
  target: Record<string, Point>,
  transition: Transition,
  durationMs: number = TRANSITION_MS,
): { positions: Record<string, Point>; finish: () => void } {
  const [progress, setProgress] = useState({ version: transition.version, t: 1 });
  // Don't animate a transition that happened before this component mounted.
  const [mountedVersion] = useState(transition.version);
  const { version, from } = transition;
  const [finishedVersion, setFinishedVersion] = useState<number | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (version === mountedVersion || prefersReducedMotion()) return;
    const start = performance.now();
    const step = (now: number) => {
      const t = durationMs > 0 ? Math.min(1, (now - start) / durationMs) : 1;
      setProgress({ version, t });
      if (t < 1) frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [version, mountedVersion, durationMs]);

  const finish = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setFinishedVersion(version);
  }, [version]);

  const isNew = progress.version !== version && version !== mountedVersion;
  const t = prefersReducedMotion() || finishedVersion === version ? 1 : isNew ? 0 : progress.t;
  return { positions: t >= 1 ? target : interpolate(from, target, easeInOut(t)), finish };
}
