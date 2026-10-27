import { describe, expect, it } from 'vitest';
import { keyframeIndexAt, sceneDuration, sceneStateAt, type Scene } from './scene';

const scene: Scene = {
  id: 'test',
  title: 'Test',
  players: [
    { id: 'a', role: 'MB', label: 'MB', team: 'us' },
    { id: 'b', role: 'OPP', label: 'OPP', team: 'us' },
  ],
  keyframes: [
    {
      time: 0,
      positions: { a: { x: 4.5, y: 8.4 }, b: { x: 8, y: 8.4 } },
      ball: { position: { x: 2, y: 10 }, height: 'high' },
      caption: 'Ready',
    },
    {
      time: 2,
      positions: { a: { x: 7, y: 8.4 }, b: { x: 8, y: 8.4 } },
      ball: { position: { x: 8, y: 10 }, height: 'low' },
      blocking: ['a', 'b'],
      caption: 'Block',
    },
    {
      time: 3,
      positions: { a: { x: 7, y: 8 }, b: { x: 8, y: 8 } },
      caption: 'Land',
    },
  ],
};

describe('sceneDuration', () => {
  it('is the time of the last keyframe', () => {
    expect(sceneDuration(scene)).toBe(3);
  });
});

describe('keyframeIndexAt', () => {
  it('gives the last keyframe at or before the time', () => {
    expect(keyframeIndexAt(scene, 0)).toBe(0);
    expect(keyframeIndexAt(scene, 1.99)).toBe(0);
    expect(keyframeIndexAt(scene, 2)).toBe(1);
    expect(keyframeIndexAt(scene, 2.5)).toBe(1);
    expect(keyframeIndexAt(scene, 3)).toBe(2);
  });

  it('clamps before the start and after the end', () => {
    expect(keyframeIndexAt(scene, -1)).toBe(0);
    expect(keyframeIndexAt(scene, 99)).toBe(2);
  });
});

describe('sceneStateAt', () => {
  it('returns the exact keyframe at its time', () => {
    const state = sceneStateAt(scene, 2);
    expect(state.positions).toEqual({ a: { x: 7, y: 8.4 }, b: { x: 8, y: 8.4 } });
    expect(state.ball).toEqual({ position: { x: 8, y: 10 }, height: 0 });
    expect(state.blocking).toEqual(['a', 'b']);
  });

  it('eases players to the midpoint halfway between keyframes', () => {
    const state = sceneStateAt(scene, 1);
    expect(state.positions.a).toEqual({ x: 5.75, y: 8.4 });
    expect(state.positions.b).toEqual({ x: 8, y: 8.4 });
  });

  it('eases in: a quarter of the way in time is less than a quarter of the way', () => {
    expect(sceneStateAt(scene, 0.5).positions.a!.x).toBeLessThan(4.5 + 2.5 / 4);
  });

  it('moves the ball at a steady speed and blends its height', () => {
    const ball = sceneStateAt(scene, 0.5).ball!;
    expect(ball.position).toEqual({ x: 3.5, y: 10 });
    expect(ball.height).toBe(0.75);
  });

  it('keeps the ball where it is when the next keyframe has none', () => {
    expect(sceneStateAt(scene, 2.5).ball?.position).toEqual({ x: 8, y: 10 });
    expect(sceneStateAt(scene, 3).ball).toBeNull();
  });

  it('shows block flags from the current moment only', () => {
    expect(sceneStateAt(scene, 1.9).blocking).toEqual([]);
    expect(sceneStateAt(scene, 2.9).blocking).toEqual(['a', 'b']);
    expect(sceneStateAt(scene, 3).blocking).toEqual([]);
  });

  it('clamps before the first and after the last keyframe', () => {
    expect(sceneStateAt(scene, -5).positions).toEqual(scene.keyframes[0]!.positions);
    expect(sceneStateAt(scene, 50).positions).toEqual(scene.keyframes[2]!.positions);
  });
});
