import type { KonvaEventObject } from 'konva/lib/Node';
import { Circle, Group, Text } from 'react-konva';
import { clampToPlayableArea } from '../domain/court';
import type { Player, Point } from '../domain/types';
import { courtColors } from './colors';
import type { CourtScale } from './scale';

const RADIUS_M = 0.4;
/** Keeps tokens readable and easy to grab on small screens. */
const MIN_RADIUS_PX = 12;

export type Emphasis = 'normal' | 'highlighted' | 'dimmed';
/** Practice feedback: whether the player stands on the right spot. */
export type Mark = 'correct' | 'wrong';

interface PlayerTokenProps {
  player: Player;
  scale: CourtScale;
  /** Without it the token cannot be dragged. */
  onMove?: (id: string, position: Point) => void;
  /** Called when the user grabs this player. */
  onDragStart?: () => void;
  emphasis?: Emphasis;
  mark?: Mark;
}

export function PlayerToken({
  player,
  scale,
  onMove,
  onDragStart,
  emphasis = 'normal',
  mark,
}: PlayerTokenProps) {
  const pixel = scale.toPixels(player.position);
  const isOpponent = player.team === 'them';
  const radius = Math.max(MIN_RADIUS_PX, scale.lengthToPixels(RADIUS_M));

  const handleDrag = (event: KonvaEventObject<DragEvent>) => {
    onMove?.(player.id, scale.toMeters(event.target.position()));
  };
  const draggable = onMove !== undefined;

  return (
    <Group
      name={isOpponent ? 'opponent' : 'player'}
      x={pixel.x}
      y={pixel.y}
      draggable={draggable}
      opacity={emphasis === 'dimmed' ? 0.35 : 1}
      dragBoundFunc={(pos) => scale.toPixels(clampToPlayableArea(scale.toMeters(pos)))}
      onDragStart={() => onDragStart?.()}
      onDragMove={handleDrag}
      onDragEnd={handleDrag}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container && draggable) container.style.cursor = 'grab';
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = '';
      }}
    >
      {emphasis === 'highlighted' && (
        <Circle
          name="highlight-ring"
          radius={radius * 1.45}
          stroke={courtColors.highlight}
          strokeWidth={Math.max(2, radius * 0.22)}
          listening={false}
        />
      )}
      {mark && (
        <Circle
          name={`mark-${mark}`}
          radius={radius * 1.45}
          stroke={mark === 'correct' ? courtColors.correct : courtColors.wrong}
          strokeWidth={Math.max(3, radius * 0.25)}
          listening={false}
        />
      )}
      <Circle
        radius={radius}
        fill={isOpponent ? courtColors.opponent : courtColors.roles[player.role]}
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
