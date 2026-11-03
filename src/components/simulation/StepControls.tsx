import type { MatchState, Side } from '../../domain/match';
import { choicesFor, nextActor, type RallyStep } from '../../content/simulation/rally';
import { strings } from '../../strings';
import { Button } from '../ui/button';

interface StepControlsProps {
  match: MatchState;
  steps: RallyStep[];
  finished: boolean;
  onStep: (step: RallyStep) => void;
  onPoint: (winner: Side) => void;
  onNextRally: () => void;
}

export function StepControls({
  match,
  steps,
  finished,
  onStep,
  onPoint,
  onNextRally,
}: StepControlsProps) {
  if (finished) {
    return (
      <Button className="w-full" onClick={onNextRally}>
        {strings.simulation.nextRally}
      </Button>
    );
  }
  const { side, easy } = nextActor(match, steps);
  const choices = choicesFor(match, side, easy);
  const label = (choice: RallyStep['attack']) =>
    side === 'us'
      ? strings.simulation.ourOptions[choice as keyof typeof strings.simulation.ourOptions]
      : strings.simulation.theirOptions[choice as keyof typeof strings.simulation.theirOptions];

  return (
    <div className="space-y-4">
      <section className="space-y-2" aria-labelledby="sim-next-action">
        <h3 id="sim-next-action" className="text-sm font-semibold">
          {strings.simulation.nextAction(side === 'us')}
        </h3>
        <div className="flex flex-wrap gap-2">
          {choices.map((choice) => (
            <Button
              key={choice}
              variant="outline"
              size="sm"
              onClick={() => onStep({ by: side, attack: choice } as RallyStep)}
            >
              {label(choice)}
            </Button>
          ))}
        </div>
      </section>
      {steps.length > 0 && (
        <section className="space-y-2" aria-labelledby="sim-end-rally">
          <h3 id="sim-end-rally" className="text-sm font-semibold">
            {strings.simulation.endRally}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onPoint('us')}>
              {strings.simulation.pointUs}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onPoint('them')}>
              {strings.simulation.pointThem}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
