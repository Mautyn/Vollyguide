import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { useMemo } from 'react';
import { CourtStage } from '../../court/CourtStage';
import { keyframeIndexAt, sceneDuration, sceneStateAt, type Scene } from '../../domain/scene';
import type { Player } from '../../domain/types';
import { strings } from '../../strings';
import { Button } from '../ui/button';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { useSceneClock } from './useSceneClock';

const SPEEDS = [0.5, 1] as const;
/** Pressing "previous" this soon after a moment starts goes to the moment before it. */
const PREVIOUS_GRACE_S = 0.3;
/** Constant: scene positions are computed here, so the court never animates on its own. */
const NO_TRANSITION = { version: 0, from: {} };

export function ScenePlayer({ scene }: { scene: Scene }) {
  const duration = sceneDuration(scene);
  const clock = useSceneClock(duration);
  const state = useMemo(() => sceneStateAt(scene, clock.time), [scene, clock.time]);
  const index = keyframeIndexAt(scene, clock.time);
  const count = scene.keyframes.length;

  const players: Player[] = scene.players.map((p) => ({
    ...p,
    position: state.positions[p.id] ?? { x: 0, y: 0 },
  }));

  const previous = () => {
    const current = scene.keyframes[index]!;
    const target = clock.time - current.time > PREVIOUS_GRACE_S ? index : Math.max(0, index - 1);
    clock.seek(scene.keyframes[target]!.time);
  };
  const next = () => clock.seek(scene.keyframes[Math.min(count - 1, index + 1)]!.time);

  return (
    <div className="space-y-4">
      <CourtStage
        players={players}
        transition={NO_TRANSITION}
        ball={state.ball}
        blocking={state.blocking}
        showZones
      />

      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground" data-testid="moment-counter">
          {strings.tactics.moment(index + 1, count)}
        </p>
        <p className="min-h-10 text-sm" data-testid="scene-caption" aria-live="polite">
          {scene.keyframes[index]?.caption}
        </p>
      </div>

      <input
        type="range"
        className="w-full accent-primary"
        min={0}
        max={duration}
        step={0.01}
        value={clock.time}
        aria-label={strings.tactics.progress}
        onChange={(e) => clock.seek(Number(e.target.value))}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          aria-label={strings.tactics.restart}
          onClick={() => clock.seek(0)}
        >
          <RotateCcw />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={strings.tactics.previous}
          onClick={previous}
        >
          <SkipBack />
        </Button>
        <Button onClick={clock.playing ? clock.pause : clock.play} className="min-w-24">
          {clock.playing ? <Pause aria-hidden /> : <Play aria-hidden />}
          {clock.playing ? strings.tactics.pause : strings.tactics.play}
        </Button>
        <Button variant="outline" size="icon" aria-label={strings.tactics.next} onClick={next}>
          <SkipForward />
        </Button>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          className="ml-auto"
          aria-label={strings.tactics.speed}
          value={String(clock.speed)}
          onValueChange={(value) => value && clock.setSpeed(Number(value))}
        >
          {SPEEDS.map((speed) => (
            <ToggleGroupItem key={speed} value={String(speed)} className="px-3">
              {strings.tactics.speedOption(speed)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
