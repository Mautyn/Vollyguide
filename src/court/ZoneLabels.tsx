import { Text } from 'react-konva';
import type { Zone } from '../domain/types';
import { courtColors } from './colors';
import type { CourtScale } from './scale';

const LABEL_SIZE_M = 0.9;

/**
 * Bottom-left corner of each zone's area on our side, in meters. Zones are 3 m wide;
 * the front row runs from the attack line (6 m) to the net, the back row from our end
 * line to the attack line. Corners keep the numbers clear of the usual player spots.
 */
const ZONE_LABEL_SPOTS: Record<Zone, { x: number; y: number }> = {
  4: { x: 0.3, y: 6.3 },
  3: { x: 3.3, y: 6.3 },
  2: { x: 6.3, y: 6.3 },
  5: { x: 0.3, y: 0.3 },
  6: { x: 3.3, y: 0.3 },
  1: { x: 6.3, y: 0.3 },
};

export function ZoneLabels({ scale }: { scale: CourtScale }) {
  const size = scale.lengthToPixels(LABEL_SIZE_M);
  return (
    <>
      {(Object.entries(ZONE_LABEL_SPOTS) as [string, { x: number; y: number }][]).map(
        ([zone, spot]) => {
          const pixel = scale.toPixels(spot);
          return (
            <Text
              key={zone}
              name="zone-label"
              text={zone}
              x={pixel.x}
              y={pixel.y - size}
              fontSize={size}
              fontFamily="Inter Variable, system-ui, sans-serif"
              fontStyle="bold"
              fill={courtColors.zoneLabel}
              listening={false}
            />
          );
        },
      )}
    </>
  );
}
