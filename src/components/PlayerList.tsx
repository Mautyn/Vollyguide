import { roleColors } from '../court/colors';
import type { Player } from '../domain/types';
import { strings } from '../strings';
import { Badge } from './ui/badge';

const formatMeters = (value: number) => `${value.toFixed(1)} m`;

interface PlayerListProps {
  players: readonly Player[];
  /** Players shown as off court, e.g. the middle blocker the libero replaced. */
  benchIds?: readonly string[];
}

export function PlayerList({ players, benchIds = [] }: PlayerListProps) {
  return (
    <ul className="divide-y" aria-label={strings.court.playersHeading}>
      {players.map((player) => (
        <li key={player.id} data-testid="player" className="flex items-center gap-3 py-2 text-sm">
          <Badge
            className="w-11 border-transparent text-white"
            style={{ backgroundColor: roleColors[player.role] }}
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
