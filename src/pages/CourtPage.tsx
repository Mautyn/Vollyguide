import { MousePointer2, RotateCcw } from 'lucide-react';
import { FormationNote } from '../components/FormationNote';
import { LiberoToggle } from '../components/LiberoToggle';
import { OverlapStatus } from '../components/OverlapStatus';
import { PhasePicker } from '../components/PhasePicker';
import { PlayerList } from '../components/PlayerList';
import { RoleLegend } from '../components/RoleLegend';
import { RotationPicker } from '../components/RotationPicker';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { CourtStage } from '../court/CourtStage';
import { lineupFromState, useCourtStore } from '../state/courtStore';
import { strings } from '../strings';

export function CourtPage() {
  const players = useCourtStore((s) => s.players);
  const serveZones = useCourtStore((s) => s.serveZones);
  const benchIds = useCourtStore((s) => s.benchIds);
  const reset = useCourtStore((s) => s.reset);
  const movePlayer = useCourtStore((s) => s.movePlayer);
  const transition = useCourtStore((s) => s.transition);
  const rotation = useCourtStore((s) => s.rotation);
  const setRotation = useCourtStore((s) => s.setRotation);
  const phase = useCourtStore((s) => s.phase);
  const setPhase = useCourtStore((s) => s.setPhase);
  const lineup = lineupFromState(players, serveZones);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <Card className="gap-4 overflow-hidden py-4">
        <CardContent className="px-4">
          <CourtStage players={players} transition={transition} onMove={movePlayer} showZones />
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
            <RotationPicker value={rotation} onChange={setRotation} />
            <PhasePicker value={phase} onChange={setPhase} />
            <LiberoToggle />
            <FormationNote />
          </CardContent>
        </Card>

        {lineup && <OverlapStatus lineup={lineup} />}

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
