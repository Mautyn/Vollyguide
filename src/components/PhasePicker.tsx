import { useId } from 'react';
import type { FormationPhase } from '../content/catalog';
import { strings } from '../strings';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

const DEFAULT_PHASES = ['base', 'receive'] as const;

interface PhasePickerProps<P extends FormationPhase> {
  value: P;
  onChange: (phase: P) => void;
  /** The phases to offer, in order. Defaults to base and receive. */
  phases?: readonly P[];
}

export function PhasePicker<P extends FormationPhase>({
  value: phase,
  onChange: setPhase,
  phases = DEFAULT_PHASES as unknown as readonly P[],
}: PhasePickerProps<P>) {
  const labelId = useId();

  return (
    <div className="space-y-2">
      <span id={labelId} className="text-sm font-medium">
        {strings.court.phaseGroup}
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        className="w-full"
        aria-labelledby={labelId}
        value={phase}
        onValueChange={(value) => value && setPhase(value as P)}
      >
        {phases.map((p) => (
          <ToggleGroupItem key={p} value={p}>
            {strings.court.phases[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">{strings.court.phaseHint}</p>
    </div>
  );
}
