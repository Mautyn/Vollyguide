import { Circle, Rect } from 'react-konva';
import { NET_Y } from '../domain/court';
import type { Player, Point } from '../domain/types';
import { courtColors, roleColors } from './colors';
import type { CourtScale } from './scale';

const BALL_RADIUS_LOW_M = 0.17;
const BALL_RADIUS_HIGH_M = 0.3;
const BLOCK_WIDTH_M = 0.8;
const BLOCK_THICKNESS_M = 0.2;

export interface BallState {
  position: Point;
  /** 0 = low, 1 = high; a high ball is drawn bigger. */
  height: number;
}

/** A short thick bar on the net in front of each player who is blocking. */
export function BlockBars({
  scale,
  players,
  blocking,
}: {
  scale: CourtScale;
  players: readonly Player[];
  blocking: readonly string[];
}) {
  return (
    <>
      {players
        .filter((p) => blocking.includes(p.id))
        .map((p) => {
          const topLeft = scale.toPixels({
            x: p.position.x - BLOCK_WIDTH_M / 2,
            y: NET_Y + BLOCK_THICKNESS_M / 2,
          });
          return (
            <Rect
              key={p.id}
              name="block-bar"
              x={topLeft.x}
              y={topLeft.y}
              width={scale.lengthToPixels(BLOCK_WIDTH_M)}
              height={scale.lengthToPixels(BLOCK_THICKNESS_M)}
              cornerRadius={scale.lengthToPixels(BLOCK_THICKNESS_M / 2)}
              fill={p.team === 'them' ? courtColors.opponent : roleColors[p.role]}
              stroke={courtColors.line}
              strokeWidth={1.5}
              listening={false}
            />
          );
        })}
    </>
  );
}

export function Ball({ scale, ball }: { scale: CourtScale; ball: BallState }) {
  const pixel = scale.toPixels(ball.position);
  const radiusM = BALL_RADIUS_LOW_M + (BALL_RADIUS_HIGH_M - BALL_RADIUS_LOW_M) * ball.height;
  return (
    <Circle
      name="ball"
      x={pixel.x}
      y={pixel.y}
      radius={Math.max(5, scale.lengthToPixels(radiusM))}
      fill={courtColors.ball}
      stroke={courtColors.line}
      strokeWidth={1.5}
      shadowColor={courtColors.playerShadow}
      shadowBlur={4 + 8 * ball.height}
      shadowOpacity={0.4}
      shadowOffsetY={2 + 6 * ball.height}
      listening={false}
    />
  );
}
