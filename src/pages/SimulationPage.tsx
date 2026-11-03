import { useId, useMemo, useState, type ReactNode } from 'react';
import { LiberoToggle } from '../components/LiberoToggle';
import { RallyLog } from '../components/simulation/RallyLog';
import { Scoreboard } from '../components/simulation/Scoreboard';
import { StepControls } from '../components/simulation/StepControls';
import { RotationPicker } from '../components/RotationPicker';
import { SystemPicker } from '../components/SystemPicker';
import { ScenePlayer } from '../components/tactics/ScenePlayer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '../components/ui/toggle-group';
import { buildRally, choicesFor, type Rally, type RallyStep } from '../content/simulation/rally';
import { opponentTeam, ourTeam } from '../content/simulation/teams';
import { buildTour } from '../content/simulation/tour';
import { newMatch, type MatchState, type Side } from '../domain/match';
import type { Scene } from '../domain/scene';
import type { Rotation, System } from '../domain/types';
import type { Locale } from '../i18n/locale';
import { useLocale } from '../state/localeStore';
import { usePreferences } from '../state/preferences';
import { strings } from '../strings';

type Mode = 'step' | 'tour';

interface Settings {
  system: System;
  rotation: Rotation;
  firstServe: Side;
}

/** The log line for a finished rally: the point and what changed after it. */
const logLine = (rally: Rally) =>
  rally.scene.keyframes
    .slice(-2)
    .map((k) => k.caption)
    .join(' ');

export function SimulationPage() {
  const locale = useLocale();
  const libero = usePreferences((s) => s.useLibero);
  const [mode, setMode] = useState<Mode>('step');
  const [settings, setSettings] = useState<Settings>({
    system: '5-1',
    rotation: 1,
    firstServe: 'them',
  });
  // Changing any setting (or the libero switch) starts a fresh match.
  const configKey = `${settings.system}-${settings.rotation}-${settings.firstServe}-${libero}-${mode}`;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-bold tracking-tight">{strings.simulation.title}</h1>
        <p className="text-muted-foreground">{strings.simulation.intro}</p>
      </div>
      {mode === 'step' ? (
        <StepSimulation
          key={configKey}
          settings={settings}
          libero={libero}
          locale={locale}
          controls={
            <SettingsCard
              mode={mode}
              setMode={setMode}
              settings={settings}
              setSettings={setSettings}
            />
          }
        />
      ) : (
        <TourSimulation
          key={configKey}
          system={settings.system}
          libero={libero}
          locale={locale}
          controls={
            <SettingsCard
              mode={mode}
              setMode={setMode}
              settings={settings}
              setSettings={setSettings}
            />
          }
        />
      )}
    </div>
  );
}

interface SettingsCardProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

function SettingsCard({ mode, setMode, settings, setSettings }: SettingsCardProps) {
  const modeId = useId();
  const serveId = useId();
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{strings.simulation.settings}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <span id={modeId} className="text-sm font-medium">
            {strings.simulation.modeGroup}
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            className="w-full"
            aria-labelledby={modeId}
            value={mode}
            onValueChange={(value) => value && setMode(value as Mode)}
          >
            {(['step', 'tour'] as const).map((m) => (
              <ToggleGroupItem key={m} value={m}>
                {strings.simulation.modes[m]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <SystemPicker
          value={settings.system}
          onChange={(system) => setSettings({ ...settings, system })}
        />
        {mode === 'step' && (
          <>
            <RotationPicker
              value={settings.rotation}
              onChange={(rotation) => setSettings({ ...settings, rotation })}
            />
            <div className="space-y-2">
              <span id={serveId} className="text-sm font-medium">
                {strings.simulation.firstServeGroup}
              </span>
              <ToggleGroup
                type="single"
                variant="outline"
                className="w-full"
                aria-labelledby={serveId}
                value={settings.firstServe}
                onValueChange={(value) =>
                  value && setSettings({ ...settings, firstServe: value as Side })
                }
              >
                {(['us', 'them'] as const).map((side) => (
                  <ToggleGroupItem key={side} value={side}>
                    {strings.simulation.firstServe[side]}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </>
        )}
        <LiberoToggle />
      </CardContent>
    </Card>
  );
}

/** The scene shown while a rally is being chosen: everything up to the last choice. */
function previewScene(match: MatchState, steps: RallyStep[], locale: Locale): Scene {
  if (steps.length === 0) {
    // Nothing chosen yet: just the serve and the pass.
    const side: Side = match.serving === 'us' ? 'them' : 'us';
    const first = { by: side, attack: choicesFor(match, side)[0]! } as RallyStep;
    const { scene } = buildRally(match, { steps: [first], winner: 'us' }, locale);
    return { ...scene, keyframes: scene.keyframes.slice(0, 2) };
  }
  const { scene } = buildRally(match, { steps, winner: 'us' }, locale);
  // Leave out the point and what follows: the result is not chosen yet.
  return { ...scene, keyframes: scene.keyframes.slice(0, -2) };
}

interface StepSimulationProps {
  settings: Settings;
  libero: boolean;
  locale: Locale;
  controls: ReactNode;
}

function StepSimulation({ settings, libero, locale, controls }: StepSimulationProps) {
  const [match, setMatch] = useState<MatchState>(() =>
    newMatch(
      ourTeam(settings.system, settings.rotation, libero),
      opponentTeam(1),
      settings.firstServe,
    ),
  );
  const [steps, setSteps] = useState<RallyStep[]>([]);
  const [result, setResult] = useState<Rally | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const shown = useMemo(() => {
    if (result) {
      // Play from the moment the point is decided.
      const keyframes = result.scene.keyframes;
      return { scene: result.scene, startAt: keyframes.at(-2)!.time };
    }
    const scene = previewScene(match, steps, locale);
    const before = steps.length === 0 ? null : previewScene(match, steps.slice(0, -1), locale);
    // Play only the new part: from the last moment that was already shown.
    const startAt = before ? scene.keyframes[before.keyframes.length - 1]!.time : 0;
    return { scene, startAt };
  }, [match, steps, result, locale]);

  const point = (winner: Side) => {
    const rally = buildRally(match, { steps, winner }, locale, log.length + 1);
    setResult(rally);
    setLog([...log, logLine(rally)]);
  };
  const nextRally = () => {
    if (!result) return;
    setMatch(result.next);
    setSteps([]);
    setResult(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Card className="py-4">
          <CardContent className="px-4">
            <ScenePlayer
              key={`${log.length}-${steps.length}-${result ? 'end' : 'play'}`}
              scene={shown.scene}
              startAt={shown.startAt}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6" data-testid="step-controls">
            <StepControls
              match={match}
              steps={steps}
              finished={result !== null}
              onStep={(step) => setSteps([...steps, step])}
              onPoint={point}
              onNextRally={nextRally}
            />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        {controls}
        <Scoreboard match={result ? result.next : match} locale={locale} />
        <RallyLog entries={log} />
      </div>
    </div>
  );
}

interface TourSimulationProps {
  system: System;
  libero: boolean;
  locale: Locale;
  controls: ReactNode;
}

function TourSimulation({ system, libero, locale, controls }: TourSimulationProps) {
  const tour = useMemo(() => buildTour(system, libero, locale), [system, libero, locale]);
  const [index, setIndex] = useState(0);
  const current = tour[index]!;
  const go = (to: number) => setIndex(Math.min(tour.length - 1, Math.max(0, to)));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-4">
        <Card className="py-4">
          <CardContent className="space-y-4 px-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium" data-testid="tour-rally">
                {strings.simulation.tourRally(index + 1, tour.length)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => go(index - 1)}
                  disabled={index === 0}
                >
                  {strings.simulation.previousRally}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => go(index + 1)}
                  disabled={index === tour.length - 1}
                >
                  {strings.simulation.nextRally}
                </Button>
              </div>
            </div>
            <ScenePlayer
              key={index}
              scene={current.rally.scene}
              onEnd={() => index < tour.length - 1 && go(index + 1)}
            />
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        {controls}
        <Scoreboard match={current.start} locale={locale} />
        <RallyLog entries={tour.slice(0, index).map((t) => logLine(t.rally))} />
      </div>
    </div>
  );
}
