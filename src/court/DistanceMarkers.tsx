import { Text } from 'react-konva';
import { COURT_WIDTH } from '../domain/court';
import { courtColors } from './colors';
import { DISTANCE_MARKERS } from './distanceMarkers';
import type { CourtScale } from './scale';

const LABEL_SIZE_M = 0.45;
const MIN_FONT_PX = 9;
/** Just outside our right sideline, in the free zone. */
const LABEL_X_M = COURT_WIDTH + 0.25;

/** Faint "0 m / 3 m / 6 m / 9 m from the net" labels beside the court. */
export function DistanceMarkers({ scale }: { scale: CourtScale }) {
  const size = Math.max(MIN_FONT_PX, scale.lengthToPixels(LABEL_SIZE_M));
  return (
    <>
      {DISTANCE_MARKERS.map(({ y, label }) => {
        const pixel = scale.toPixels({ x: LABEL_X_M, y });
        return (
          <Text
            key={y}
            name="distance-marker"
            text={label}
            x={pixel.x}
            y={pixel.y - size / 2}
            fontSize={size}
            fontFamily="Inter Variable, system-ui, sans-serif"
            fontStyle="bold"
            fill={courtColors.distanceLabel}
            listening={false}
          />
        );
      })}
    </>
  );
}
