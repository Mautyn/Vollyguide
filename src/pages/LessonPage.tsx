import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router';
import { OverlapStatus } from '../components/OverlapStatus';
import { RoleLegend } from '../components/RoleLegend';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../components/ui/card';
import { findLesson, resolveCourt, type Lesson } from '../content/lessons';
import { CourtStage } from '../court/CourtStage';
import type { Transition } from '../domain/interpolate';
import { lineupFromState, positionsById } from '../state/courtStore';
import { strings } from '../strings';
import { cn } from '../lib/utils';
import { stepIndexFromParam } from './lessonStep';
import { NotFoundPage } from './NotFoundPage';

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = findLesson(lessonId);
  if (!lesson) return <NotFoundPage />;
  // Fresh state per lesson, so animations never run between lessons.
  return <LessonView key={lesson.id} lesson={lesson} />;
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const count = lesson.steps.length;
  const index = stepIndexFromParam(searchParams.get('step'), count);
  const step = lesson.steps[index]!;
  const court = useMemo(() => resolveCourt(step.court), [step]);
  const lineup = lineupFromState(court.players, court.zones);

  // Animate from the previous step's positions whenever the step changes.
  const [shown, setShown] = useState<{ index: number; transition: Transition }>({
    index,
    transition: { version: 0, from: {} },
  });
  if (shown.index !== index) {
    const previous = lesson.steps[shown.index];
    setShown({
      index,
      transition: {
        version: shown.transition.version + 1,
        from: previous ? positionsById(resolveCourt(previous.court).players) : {},
      },
    });
  }

  const goTo = (i: number) => setSearchParams({ step: String(i + 1) });
  const isLast = index === count - 1;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <Card className="gap-4 overflow-hidden py-4 lg:order-none">
        <CardContent className="px-4">
          <CourtStage
            players={court.players}
            transition={shown.transition}
            highlight={step.highlight}
            showZones
          />
        </CardContent>
        <CardContent className="px-4">
          <RoleLegend roles={court.players.map((p) => p.role)} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-2">
          <Link
            to="/lessons"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {strings.lessons.allLessons}
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
        </div>

        <Card>
          <CardHeader className="gap-3">
            <nav aria-label={strings.lessons.stepsNav} className="flex gap-1.5">
              {lesson.steps.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  aria-label={strings.lessons.goToStep(i + 1)}
                  aria-current={i === index ? 'step' : undefined}
                  onClick={() => goTo(i)}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    i <= index ? 'bg-primary' : 'bg-muted hover:bg-muted-foreground/30',
                  )}
                />
              ))}
            </nav>
            <p className="text-xs font-medium text-muted-foreground" data-testid="step-counter">
              {strings.lessons.stepOf(index + 1, count)}
            </p>
            <h2 className="text-lg font-semibold">{step.title}</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed">
            {step.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </CardContent>
          <CardFooter className="justify-between gap-2">
            <Button variant="outline" disabled={index === 0} onClick={() => goTo(index - 1)}>
              <ArrowLeft aria-hidden />
              {strings.lessons.previous}
            </Button>
            {isLast ? (
              <Button asChild>
                <Link to="/lessons">{strings.lessons.finish}</Link>
              </Button>
            ) : (
              <Button onClick={() => goTo(index + 1)}>
                {strings.lessons.next}
                <ArrowRight aria-hidden />
              </Button>
            )}
          </CardFooter>
        </Card>

        {lineup && <OverlapStatus lineup={lineup} />}
      </div>
    </div>
  );
}
