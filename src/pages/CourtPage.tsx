import { MousePointer2, RotateCcw } from 'lucide-react';
import { useMemo } from 'react';
import { FormationNote } from '../components/FormationNote';
import { LiberoToggle } from '../components/LiberoToggle';
import { OpponentToggle } from '../components/OpponentToggle';
import { OverlapStatus } from '../components/OverlapStatus';
import { PhasePicker } from '../components/PhasePicker';
import { PlayerList } from '../components/PlayerList';
import { RoleLegend } from '../components/RoleLegend';
import { RotationPicker } from '../components/RotationPicker';
import { ServeSwitch } from '../components/ServeSwitch';
import { SystemPicker } from '../components/SystemPicker';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { CourtStage } from '../court/CourtStage';
import { BASE_SPOTS } from '../content/formations';
import { opponentPlayers } from '../content/opponent';
import { serverId, SERVING_ZONE, withServerExempt } from '../domain/serve';
import { lineupFromState, useCourtStore, type CourtPhase } from '../state/courtStore';
import { strings } from '../strings';

/** The opponent never moves, so build it once. */
const OPPONENT = opponentPlayers();

const COURT_PHASES: readonly CourtPhase[] = ['base', 'serve', 'receive'];

/** The ball is drawn just right of the server's feet. */
const BALL_OFFSET_X = 0.45;

export function CourtPage() {
  const players = useCourtStore((s) => s.players);
  const serveZones = useCourtStore((s) => s.serveZones);
  const benchIds = useCourtStore((s) => s.benchIds);
  const opponentVisible = useCourtStore((s) => s.showOpponent && s.phase === 'receive');
  const onCourt = useMemo(
    () => (opponentVisible ? [...players, ...OPPONENT] : players),
    [players, opponentVisible],
  );
  const reset = useCourtStore((s) => s.reset);
  const movePlayer = useCourtStore((s) => s.movePlayer);
  const transition = useCourtStore((s) => s.transition);
  const system = useCourtStore((s) => s.system);
  const setSystem = useCourtStore((s) => s.setSystem);
  const rotation = useCourtStore((s) => s.rotation);
  const setRotation = useCourtStore((s) => s.setRotation);
  const phase = useCourtStore((s) => s.phase);
  const setPhase = useCourtStore((s) => s.setPhase);
  const switched = useCourtStore((s) => s.switched);
  const fullLineup = lineupFromState(players, serveZones);
  // The server is exempt from the overlap rule; the zone-1 base spot stands in for them.
  const lineup =
    fullLineup && phase === 'serve'
      ? withServerExempt(fullLineup, BASE_SPOTS[SERVING_ZONE])
      : fullLineup;
  const server =
    phase === 'serve' && !switched ? players.find((p) => p.id === serverId(serveZones)) : undefined;
  const ball = server
    ? { position: { x: server.position.x + BALL_OFFSET_X, y: server.position.y }, height: 0 }
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="gap-4 overflow-hidden py-4">
        <CardContent className="px-4">
          <CourtStage
            players={onCourt}
            transition={transition}
            onMove={movePlayer}
            showZones
            ball={ball}
          />
        </CardContent>
        <CardContent className="px-4">
          <RoleLegend roles={players.map((p) => p.role)} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{strings.court.title}</h1>
          <p className="flex gap-2 text-sm text-muted-foreground">
            <MousePointer2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            {strings.court.hint}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>{strings.court.formationHeading}</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <SystemPicker value={system} onChange={setSystem} />
            <RotationPicker value={rotation} onChange={setRotation} />
            <PhasePicker value={phase} onChange={setPhase} phases={COURT_PHASES} />
            <ServeSwitch />
            <LiberoToggle />
            <OpponentToggle />
            <FormationNote />
          </CardContent>
        </Card>

        {switched ? (
          <p className="text-sm text-muted-foreground" data-testid="after-serve">
            {strings.court.afterServe}
          </p>
        ) : (
          lineup && <OverlapStatus lineup={lineup} />
        )}

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>
              <h2>{strings.court.playersHeading}</h2>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw aria-hidden />
              {strings.court.reset}
            </Button>
          </CardHeader>
          <Separator />
          <CardContent>
            <PlayerList players={players} benchIds={benchIds} />
            {opponentVisible && (
              <div className="mt-4 space-y-1">
                <h3 className="text-sm font-semibold">{strings.court.opponentHeading}</h3>
                <PlayerList
                  players={OPPONENT}
                  label={strings.court.opponentHeading}
                  itemTestId="opponent-player"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
