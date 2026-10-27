import type { KonvaEventObject } from 'konva/lib/Node';
import { Circle, Group, Text } from 'react-konva';
import { clampToPlayableArea } from '../domain/court';
import type { Player, Point } from '../domain/types';
import { courtColors } from './colors';
import type { CourtScale } from './scale';

const RADIUS_M = 0.4;
/** Keeps tokens readable and easy to grab on small screens. */
const MIN_RADIUS_PX = 12;

interface PlayerTokenProps {
  player: Player;
  scale: CourtScale;
  onMove: (id: string, position: Point) => void;
}

export function PlayerToken({ player, scale, onMove }: PlayerTokenProps) {
  const pixel = scale.toPixels(player.position);
  const radius = Math.max(MIN_RADIUS_PX, scale.lengthToPixels(RADIUS_M));

  const handleDrag = (event: KonvaEventObject<DragEvent>) => {
    onMove(player.id, scale.toMeters(event.target.position()));
  };

  return (
    <Group
      name="player"
      x={pixel.x}
      y={pixel.y}
      draggable
      dragBoundFunc={(pos) => scale.toPixels(clampToPlayableArea(scale.toMeters(pos)))}
      onDragMove={handleDrag}
      onDragEnd={handleDrag}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = 'grab';
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = '';
      }}
    >
      <Circle
        radius={radius}
        fill={courtColors.roles[player.role]}
        stroke={courtColors.line}
        strokeWidth={2}
        shadowColor={courtColors.playerShadow}
        shadowBlur={6}
        shadowOpacity={0.35}
        shadowOffsetY={2}
      />
      <Text
        text={player.label}
        fill={courtColors.playerText}
        fontFamily="Inter Variable, system-ui, sans-serif"
        fontStyle="bold"
        fontSize={radius * 0.75}
        width={radius * 2}
        height={radius * 2}
        offsetX={radius}
        offsetY={radius}
        align="center"
        verticalAlign="middle"
        listening={false}
      />
    </Group>
  );
}
