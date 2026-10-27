import { useCallback, useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export interface SceneClock {
  /** Seconds from the start, 0..duration. */
  time: number;
  playing: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  /** Jumps to a time and pauses. */
  seek: (time: number) => void;
  setSpeed: (speed: number) => void;
}

/**
 * Playback time for an animated scene. Plays on mount unless the user prefers reduced
 * motion; stops at the end; Play at the end starts again from the beginning.
 */
export function useSceneClock(duration: number): SceneClock {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [speed, setSpeed] = useState(1);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const step = (now: number) => {
      const next = Math.min(duration, timeRef.current + ((now - last) / 1000) * speed);
      last = now;
      timeRef.current = next;
      setTime(next);
      if (next >= duration) setPlaying(false);
      else frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, duration]);

  const seek = useCallback(
    (to: number) => {
      const clamped = Math.min(duration, Math.max(0, to));
      timeRef.current = clamped;
      setTime(clamped);
      setPlaying(false);
    },
    [duration],
  );

  const play = useCallback(() => {
    if (timeRef.current >= duration) {
      timeRef.current = 0;
      setTime(0);
    }
    setPlaying(true);
  }, [duration]);

  const pause = useCallback(() => setPlaying(false), []);

  return { time, playing, speed, play, pause, seek, setSpeed };
}
