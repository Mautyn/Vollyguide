import { Check, CircleCheck, CircleX, Eye, RotateCcw, Shuffle } from 'lucide-react';
import { LiberoToggle } from '../components/LiberoToggle';
import { OverlapStatus } from '../components/OverlapStatus';
import { PhasePicker } from '../components/PhasePicker';
import { RoleLegend } from '../components/RoleLegend';
import { RotationPicker } from '../components/RotationPicker';
import { SystemPicker } from '../components/SystemPicker';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CourtStage } from '../court/CourtStage';
import { roleColors } from '../court/colors';
import type { Mark } from '../court/PlayerToken';
import { DEFAULT_TOLERANCE_M } from '../domain/grading';
import { lineupFromState } from '../state/courtStore';
import { usePracticeStore } from '../state/practiceStore';
import { strings } from '../strings';
import { cn } from '../lib/utils';

export function PracticePage() {
  const {
    system,
    setSystem,
    rotation,
    phase,
    players,
    zones,
    grade,
    transition,
    setTask,
    randomTask,
    movePlayer,
    check,
    showAnswer,
    tryAgain,
  } = usePracticeStore();

  const marks: Record<string, Mark> | undefined = grade
    ? Object.fromEntries(
        grade.players.map((g) => [g.id, g.result === 'correct' ? 'correct' : 'wrong']),
      )
    : undefined;
  const lineup = lineupFromState(players, zones);
  const playerById = new Map(players.map((p) => [p.id, p]));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <Card className="gap-4 overflow-hidden py-4">
        <CardContent className="px-4">
          <CourtStage
            players={players}
            transition={transition}
            onMove={movePlayer}
            marks={marks}
            showZones
          />
        </CardContent>
        <CardContent className="px-4">
          <RoleLegend roles={players.map((p) => p.role)} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">{strings.practice.title}</h1>
          <p className="text-sm text-muted-foreground">{strings.practice.hint}</p>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>
              <h2>{strings.practice.taskHeading}</h2>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => randomTask()}>
              <Shuffle aria-hidden />
              {strings.practice.randomTask}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <SystemPicker value={system} onChange={setSystem} />
            <RotationPicker value={rotation} onChange={(r) => setTask(r, phase)} />
            <PhasePicker value={phase} onChange={(p) => setTask(rotation, p)} />
            <LiberoToggle />
            <p className="text-sm font-medium" data-testid="practice-task">
              {strings.practice.task(system, rotation, strings.court.phases[phase])}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={check}>
                <Check aria-hidden />
                {strings.practice.check}
              </Button>
              <Button variant="outline" onClick={showAnswer}>
                <Eye aria-hidden />
                {strings.practice.showAnswer}
              </Button>
              <Button variant="ghost" onClick={tryAgain}>
                <RotateCcw aria-hidden />
                {strings.practice.tryAgain}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {strings.practice.tolerance(DEFAULT_TOLERANCE_M)}
            </p>
          </CardContent>
        </Card>

        {grade && (
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>{strings.practice.resultHeading}</h2>
              </CardTitle>
              <p
                className={cn(
                  'text-lg font-semibold',
                  grade.correctCount === grade.players.length && grade.legal
                    ? 'text-success'
                    : 'text-foreground',
                )}
                data-testid="practice-result"
                aria-live="polite"
              >
                {strings.practice.result(grade.correctCount, grade.players.length, grade.legal)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="divide-y text-sm">
                {grade.players.map((g) => {
                  const player = playerById.get(g.id);
                  if (!player) return null;
                  return (
                    <li key={g.id} className="flex items-center gap-3 py-2" data-testid="grade">
                      <Badge
                        className="w-11 border-transparent text-white"
                        style={{ backgroundColor: roleColors[player.role] }}
                      >
                        {player.label}
                      </Badge>{' '}
                      <span className="font-medium">{strings.roles[player.role]}</span>{' '}
                      <span
                        className={cn(
                          'ml-auto flex items-center gap-1.5',
                          g.result === 'correct' ? 'text-success' : 'text-destructive',
                        )}
                      >
                        {g.result === 'correct' ? (
                          <CircleCheck className="size-4" aria-hidden />
                        ) : (
                          <CircleX className="size-4" aria-hidden />
                        )}
                        {g.result === 'correct'
                          ? strings.practice.correct
                          : strings.practice.off(g.distance)}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {lineup && <OverlapStatus lineup={lineup} />}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
