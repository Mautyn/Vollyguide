import { useEffect, useMemo, useRef, useState } from 'react';
import { Layer, Stage } from 'react-konva';
import type { Transition } from '../domain/interpolate';
import type { Player, Point } from '../domain/types';
import { strings } from '../strings';
import { CourtLines } from './CourtLines';
import { DistanceMarkers } from './DistanceMarkers';
import { PlayerToken, type Mark } from './PlayerToken';
import { Ball, BlockBars, type BallState } from './SceneOverlay';
import { fitCourtScale } from './scale';
import { useAnimatedPositions } from './useAnimatedPositions';
import { useElementSize } from './useElementSize';
import { ZoneLabels } from './ZoneLabels';

/** True once web fonts have loaded, so canvas text can be redrawn in Inter. */
function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return ready;
}

/** Upper bound for the court height so the page stays usable on large screens. */
const MAX_STAGE_HEIGHT = 900;

interface CourtStageProps {
  /** Positions in meters. */
  players: readonly Player[];
  /** Formation changes to animate. */
  transition: Transition;
  /** Called while a player is dragged. Without it the court is read-only. */
  onMove?: (id: string, position: Point) => void;
  /** Player ids to emphasise; everyone else is dimmed. Empty or missing: nobody is dimmed. */
  highlight?: readonly string[];
  /** Shows faint zone numbers on our side of the net. */
  showZones?: boolean;
  /** Practice feedback per player id. */
  marks?: Readonly<Record<string, Mark>>;
  /** The ball, for animated situations. */
  ball?: BallState | null;
  /** Ids of players drawn with a block bar at the net. */
  blocking?: readonly string[];
}

export function CourtStage({
  players,
  transition,
  onMove,
  highlight = [],
  showZones = false,
  marks,
  ball,
  blocking = [],
}: CourtStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(containerRef);
  const target = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p.position])),
    [players],
  );
  const { positions: shown, finish } = useAnimatedPositions(target, transition);
  const fontsReady = useFontsReady();

  const maxHeight = Math.min(MAX_STAGE_HEIGHT, Math.max(400, window.innerHeight - 160));
  const scale = fitCourtScale(width || 360, maxHeight);

  return (
    <div
      ref={containerRef}
      className="flex w-full min-w-0 justify-center"
      role="img"
      aria-label={onMove ? strings.court.canvasLabel : strings.court.canvasLabelReadOnly}
      data-testid="court-stage"
    >
      <Stage
        width={scale.stageWidth}
        height={scale.stageHeight}
        style={{ borderRadius: 12, overflow: 'hidden' }}
      >
        <Layer>
          <CourtLines scale={scale} />
        </Layer>
        {/* Remount once fonts load: Konva measures text when it is created. */}
        <Layer key={fontsReady ? 'fonts' : 'fallback'}>
          {showZones && <ZoneLabels scale={scale} />}
          <DistanceMarkers scale={scale} />
          {players.map((player) => (
            <PlayerToken
              key={player.id}
              player={{ ...player, position: shown[player.id] ?? player.position }}
              scale={scale}
              // Only our own players can be dragged.
              onMove={player.team === 'us' ? onMove : undefined}
              onDragStart={finish}
              mark={marks?.[player.id]}
              emphasis={
                highlight.length === 0
                  ? 'normal'
                  : highlight.includes(player.id)
                    ? 'highlighted'
                    : 'dimmed'
              }
            />
          ))}
        </Layer>
        <Layer listening={false}>
          <BlockBars
            scale={scale}
            players={players.map((p) => ({ ...p, position: shown[p.id] ?? p.position }))}
            blocking={blocking}
          />
          {ball && <Ball scale={scale} ball={ball} />}
        </Layer>
      </Stage>
    </div>
  );
}
