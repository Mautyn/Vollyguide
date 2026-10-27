import { useRef } from 'react';
import { Layer, Stage } from 'react-konva';
import { useCourtStore } from '../state/courtStore';
import { strings } from '../strings';
import { CourtLines } from './CourtLines';
import { PlayerToken } from './PlayerToken';
import { fitCourtScale } from './scale';
import { useElementSize } from './useElementSize';

/** Upper bound for the court height so the page stays usable on large screens. */
const MAX_STAGE_HEIGHT = 900;

export function CourtStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useElementSize(containerRef);
  const players = useCourtStore((s) => s.players);
  const movePlayer = useCourtStore((s) => s.movePlayer);

  const maxHeight = Math.min(MAX_STAGE_HEIGHT, Math.max(400, window.innerHeight - 160));
  const scale = fitCourtScale(width || 360, maxHeight);

  return (
    <div
      ref={containerRef}
      className="court-stage"
      role="img"
      aria-label={strings.court.canvasLabel}
      data-testid="court-stage"
    >
      <Stage width={scale.stageWidth} height={scale.stageHeight}>
        <Layer>
          <CourtLines scale={scale} />
        </Layer>
        <Layer>
          {players.map((player) => (
            <PlayerToken key={player.id} player={player} scale={scale} onMove={movePlayer} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
