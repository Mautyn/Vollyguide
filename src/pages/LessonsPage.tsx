import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { LESSONS } from '../content/lessons';
import { strings } from '../strings';

export function LessonsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">{strings.lessons.title}</h1>
        <p className="text-muted-foreground">{strings.lessons.intro}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LESSONS.map((lesson, i) => (
          <li key={lesson.id}>
            <Link
              to={`/lessons/${lesson.id}`}
              className="group block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <BookOpen className="size-5" aria-hidden />
                    </div>
                    <Badge variant="secondary">
                      {strings.lessons.stepCount(lesson.steps.length)}
                    </Badge>
                  </div>
                  <CardTitle>
                    <h2>
                      {i + 1}. {lesson.title}
                    </h2>
                  </CardTitle>
                  <CardDescription>{lesson.summary}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto gap-1.5 text-sm font-medium text-primary">
                  {strings.lessons.start}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </CardFooter>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
