import type { Player } from '../domain/types';
import { strings } from '../strings';

const formatMeters = (value: number) => `${value.toFixed(1)} m`;

export function PlayerList({ players }: { players: readonly Player[] }) {
  return (
    <section aria-labelledby="players-heading">
      <h2 id="players-heading">{strings.court.playersHeading}</h2>
      <ul className="player-list" aria-labelledby="players-heading">
        {players.map((player) => (
          <li key={player.id} data-testid="player">
            <strong>{player.label}</strong> {strings.roles[player.role]}: x{' '}
            {formatMeters(player.position.x)}, y {formatMeters(player.position.y)}
          </li>
        ))}
      </ul>
    </section>
  );
}
