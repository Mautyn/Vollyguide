import { useId } from 'react';
import type { FormationPhase } from '../content/catalog';
import { strings } from '../strings';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

const PHASES: readonly FormationPhase[] = ['base', 'receive'];

interface PhasePickerProps {
  value: FormationPhase;
  onChange: (phase: FormationPhase) => void;
}

export function PhasePicker({ value: phase, onChange: setPhase }: PhasePickerProps) {
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
        onValueChange={(value) => value && setPhase(value as FormationPhase)}
      >
        {PHASES.map((p) => (
          <ToggleGroupItem key={p} value={p}>
            {strings.court.phases[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">{strings.court.phaseHint}</p>
    </div>
  );
}
