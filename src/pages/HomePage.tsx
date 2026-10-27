import { ArrowRight, RotateCw, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { strings } from '../strings';

const featureIcons = [RotateCw, Users, ShieldCheck];

export function HomePage() {
  return (
    <div className="space-y-12 py-4 sm:py-10">
      <section className="max-w-2xl space-y-5">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">
          {strings.home.eyebrow}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {strings.home.title}
        </h1>
        <p className="text-lg text-pretty text-muted-foreground">{strings.home.intro}</p>
        <Button asChild size="lg">
          <Link to="/court">
            {strings.home.openCourt}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {strings.home.features.map((feature, i) => {
          const Icon = featureIcons[i] ?? RotateCw;
          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle>
                  <h2>{feature.title}</h2>
                </CardTitle>
                <CardDescription>{feature.body}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
