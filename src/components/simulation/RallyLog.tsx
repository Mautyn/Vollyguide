import { strings } from '../../strings';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

/** Finished rallies, newest first: what the point was and what changed after it. */
export function RallyLog({ entries }: { entries: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{strings.simulation.log}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{strings.simulation.logEmpty}</p>
        ) : (
          <ol className="space-y-1.5 text-sm" data-testid="rally-log">
            {entries
              .map((text, i) => ({ text, n: i + 1 }))
              .reverse()
              .map(({ text, n }) => (
                <li key={n}>
                  <span className="font-medium">{strings.simulation.rally(n)}:</span> {text}
                </li>
              ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
