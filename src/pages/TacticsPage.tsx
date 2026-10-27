import { Navigate, NavLink, useParams } from 'react-router';
import { ScenePlayer } from '../components/tactics/ScenePlayer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { findSituation, findTopic, TACTICS, type Situation } from '../content/tactics';
import { cn } from '../lib/utils';
import { strings } from '../strings';
import { NotFoundPage } from './NotFoundPage';

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-background text-foreground shadow-sm'
      : 'text-muted-foreground hover:text-foreground',
  );

const pillClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full border px-3 py-1 text-sm transition-colors',
    isActive
      ? 'border-primary bg-primary text-primary-foreground'
      : 'bg-card text-muted-foreground hover:text-foreground',
  );

export function TacticsPage() {
  const { topicId, situationId } = useParams();
  const first = TACTICS[0]!;

  if (!topicId) {
    return <Navigate replace to={`/tactics/${first.id}/${first.situations[0]!.id}`} />;
  }
  const topic = findTopic(topicId);
  if (!topic) return <NotFoundPage />;
  if (!situationId) {
    return <Navigate replace to={`/tactics/${topic.id}/${topic.situations[0]!.id}`} />;
  }
  const situation = findSituation(topic, situationId);
  if (!situation) return <NotFoundPage />;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">{strings.tactics.title}</h1>
        <p className="text-muted-foreground">{strings.tactics.intro}</p>
      </div>

      <nav
        aria-label={strings.tactics.topicsNav}
        className="inline-flex flex-wrap gap-1 rounded-lg bg-muted p-1"
      >
        {TACTICS.map((t) => (
          <NavLink key={t.id} to={`/tactics/${t.id}`} className={tabClass}>
            {t.title}
          </NavLink>
        ))}
      </nav>

      <nav aria-label={strings.tactics.situationsNav} className="flex flex-wrap gap-2">
        {topic.situations.map((s) => (
          <NavLink key={s.id} to={`/tactics/${topic.id}/${s.id}`} className={pillClass}>
            {s.title}
          </NavLink>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="py-4">
          <CardContent className="px-4">
            {/* Remount per situation so playback starts from the beginning. */}
            <ScenePlayer key={situation.id} scene={situation.scene} />
          </CardContent>
        </Card>
        <SituationText situation={situation} />
      </div>
    </div>
  );
}

function SituationText({ situation }: { situation: Situation }) {
  const sections = [
    { title: strings.tactics.positioning, items: situation.positioning },
    { title: strings.tactics.execution, items: situation.execution },
    { title: strings.tactics.principles, items: situation.principles },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg">{situation.title}</h2>
        </CardTitle>
        <CardDescription>{situation.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {sections.map((section) => (
          <section key={section.title} className="space-y-1.5">
            <h3 className="text-sm font-semibold">{section.title}</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
