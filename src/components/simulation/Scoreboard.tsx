import { rotationNumber, server, type MatchState } from '../../domain/match';
import { withServerExempt } from '../../domain/serve';
import type { Point, ZoneMap } from '../../domain/types';
import { ZONES } from '../../domain/zones';
import { BASE_SPOTS } from '../../content/formations';
import { phasePositions } from '../../content/simulation/positions';
import { playerName } from '../../content/simulation/rally';
import { teamOnCourt } from '../../content/simulation/teams';
import type { Locale } from '../../i18n/locale';
import { strings } from '../../strings';
import { OverlapStatus } from '../OverlapStatus';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

/** Our lineup at the moment of serve, as the overlap rule sees it (server exempt). */
function ourServeLineup(match: MatchState): ZoneMap<Point> {
  const team = teamOnCourt(match, 'us');
  const positions = phasePositions(team, { kind: team.serving ? 'serve' : 'receive' });
  const lineup = Object.fromEntries(
    ZONES.map((z) => [z, positions[team.zones[z]]!]),
  ) as ZoneMap<Point>;
  return team.serving ? withServerExempt(lineup, BASE_SPOTS[1]) : lineup;
}

export function Scoreboard({ match, locale }: { match: MatchState; locale: Locale }) {
  const rows: [string, string, string][] = [
    [strings.simulation.server, playerName(server(match), match.us.system, locale), 'sim-server'],
    [strings.simulation.ourRotation, String(rotationNumber(match.us)), 'our-rotation'],
    [strings.simulation.theirRotation, String(rotationNumber(match.them)), 'their-rotation'],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{strings.simulation.scoreboard}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="flex items-baseline justify-center gap-3 text-2xl font-bold tabular-nums">
          <span className="text-sm font-medium text-muted-foreground">{strings.simulation.us}</span>
          <span data-testid="score">
            {match.score.us}–{match.score.them}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {strings.simulation.them}
          </span>
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {rows.map(([label, value, testId]) => (
            <div key={testId} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium" data-testid={testId}>
                {value}
              </dd>
            </div>
          ))}
        </dl>
        <OverlapStatus lineup={ourServeLineup(match)} />
      </CardContent>
    </Card>
  );
}
