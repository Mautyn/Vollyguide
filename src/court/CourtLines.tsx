import { Line, Rect } from 'react-konva';
import {
  COURT_LENGTH,
  COURT_WIDTH,
  NET_Y,
  OUR_ATTACK_LINE_Y,
  THEIR_ATTACK_LINE_Y,
} from '../domain/court';
import { courtColors } from './colors';
import type { CourtScale } from './scale';

const LINE_WIDTH_M = 0.05;

export function CourtLines({ scale }: { scale: CourtScale }) {
  const topLeft = scale.toPixels({ x: 0, y: COURT_LENGTH });
  const lineWidth = Math.max(1, scale.lengthToPixels(LINE_WIDTH_M));

  const horizontal = (y: number, width = lineWidth, color: string = courtColors.line) => {
    const left = scale.toPixels({ x: 0, y });
    const right = scale.toPixels({ x: COURT_WIDTH, y });
    return (
      <Line
        key={y}
        points={[left.x, left.y, right.x, right.y]}
        stroke={color}
        strokeWidth={width}
        listening={false}
      />
    );
  };

  return (
    <>
      <Rect
        width={scale.stageWidth}
        height={scale.stageHeight}
        fill={courtColors.freeZone}
        listening={false}
      />
      <Rect
        x={topLeft.x}
        y={topLeft.y}
        width={scale.lengthToPixels(COURT_WIDTH)}
        height={scale.lengthToPixels(COURT_LENGTH)}
        fill={courtColors.court}
        stroke={courtColors.line}
        strokeWidth={lineWidth}
        listening={false}
      />
      {horizontal(OUR_ATTACK_LINE_Y)}
      {horizontal(THEIR_ATTACK_LINE_Y)}
      {horizontal(NET_Y, lineWidth * 4, courtColors.net)}
      {horizontal(NET_Y, lineWidth, courtColors.netTape)}
    </>
  );
}
