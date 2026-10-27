import { easeInOut, interpolatePoint } from './interpolate';
import type { Point, Role, Team } from './types';

export type BallHeight = 'low' | 'high';

export interface ScenePlayer {
  id: string;
  role: Role;
  label: string;
  team: Team;
}

/** One moment of a scene. Positions are in meters, in the shared court frame. */
export interface Keyframe {
  /** Seconds from the start of the scene. */
  time: number;
  /** Position of every player in the scene. */
  positions: Readonly<Record<string, Point>>;
  ball?: { position: Point; height: BallHeight };
  /** Ids of players jumping to block at this moment. */
  blocking?: readonly string[];
  caption: string;
}

export interface Scene {
  id: string;
  title: string;
  players: readonly ScenePlayer[];
  keyframes: readonly Keyframe[];
}

export interface SceneState {
  positions: Record<string, Point>;
  /** `height` runs from 0 (low) to 1 (high), so the ball can grow while it is high. */
  ball: { position: Point; height: number } | null;
  blocking: readonly string[];
}

const HEIGHT: Record<BallHeight, number> = { low: 0, high: 1 };

export function sceneDuration(scene: Scene): number {
  return scene.keyframes[scene.keyframes.length - 1]?.time ?? 0;
}

/** Index of the moment shown at `time`: the last keyframe at or before it. */
export function keyframeIndexAt(scene: Scene, time: number): number {
  let index = 0;
  scene.keyframes.forEach((keyframe, i) => {
    if (keyframe.time <= time) index = i;
  });
  return index;
}

/**
 * Players, ball and block at any time. Players ease in and out between keyframes; the
 * ball flies at a steady speed. Times before the first or after the last keyframe clamp.
 */
export function sceneStateAt(scene: Scene, time: number): SceneState {
  const index = keyframeIndexAt(scene, time);
  const from = scene.keyframes[index];
  if (!from) return { positions: {}, ball: null, blocking: [] };
  const to = scene.keyframes[index + 1];
  const blocking = from.blocking ?? [];

  if (!to || time <= from.time) {
    return {
      positions: { ...from.positions },
      ball: from.ball ? { position: from.ball.position, height: HEIGHT[from.ball.height] } : null,
      blocking,
    };
  }

  const t = (time - from.time) / (to.time - from.time);
  const eased = easeInOut(t);
  const positions: Record<string, Point> = {};
  for (const [id, start] of Object.entries(from.positions)) {
    positions[id] = interpolatePoint(start, to.positions[id] ?? start, eased);
  }

  let ball: SceneState['ball'] = null;
  if (from.ball) {
    const end = to.ball ?? from.ball;
    ball = {
      position: interpolatePoint(from.ball.position, end.position, t),
      height: HEIGHT[from.ball.height] + (HEIGHT[end.height] - HEIGHT[from.ball.height]) * t,
    };
  }

  return { positions, ball, blocking };
}
