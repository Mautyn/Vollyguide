import { courtColors, roleColors } from '../court/colors';
import type { Player } from '../domain/types';
import { strings } from '../strings';
import { Badge } from './ui/badge';

const formatMeters = (value: number) => `${value.toFixed(1)} m`;

interface PlayerListProps {
  players: readonly Player[];
  /** Players shown as off court, e.g. the middle blocker the libero replaced. */
  benchIds?: readonly string[];
  /** Accessible name of the list. */
  label?: string;
  /** Test id of each row. */
  itemTestId?: string;
}

export function PlayerList({
  players,
  benchIds = [],
  label = strings.court.playersHeading,
  itemTestId = 'player',
}: PlayerListProps) {
  return (
    <ul className="divide-y" aria-label={label}>
      {players.map((player) => (
        <li
          key={player.id}
          data-testid={itemTestId}
          className="flex items-center gap-3 py-2 text-sm"
        >
          <Badge
            className="w-11 border-transparent text-white"
            style={{
              backgroundColor:
                player.team === 'them' ? courtColors.opponent : roleColors[player.role],
            }}
          >
            {player.label}
          </Badge>{' '}
          <span className="font-medium">{strings.roles[player.role]}</span>{' '}
          {benchIds.includes(player.id) && (
            <>
              <Badge variant="outline">{strings.court.bench}</Badge>{' '}
            </>
          )}
          <span className="ml-auto whitespace-nowrap text-muted-foreground tabular-nums">
            x {formatMeters(player.position.x)}, y {formatMeters(player.position.y)}
          </span>
        </li>
      ))}
    </ul>
  );
}
