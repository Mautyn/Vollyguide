import { courtColors, roleColors } from '../court/colors';
import { toNetRelative } from '../domain/netRelative';
import type { Player } from '../domain/types';
import { strings } from '../strings';
import { Badge } from './ui/badge';

function formatPosition(player: Player): string {
  const { fromLeft, fromNet } = toNetRelative(player.position, player.team);
  return strings.court.position(fromLeft, fromNet);
}

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
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{strings.roles[player.role]}</span>
              {benchIds.includes(player.id) && (
                <>
                  {' '}
                  <Badge variant="outline">{strings.court.bench}</Badge>
                </>
              )}
            </div>{' '}
            <div className="text-xs text-muted-foreground tabular-nums">
              {formatPosition(player)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
