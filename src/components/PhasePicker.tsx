import { useCourtStore, type CourtPhase } from '../state/courtStore';
import { strings } from '../strings';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

const PHASES: readonly CourtPhase[] = ['base', 'receive'];

export function PhasePicker() {
  const phase = useCourtStore((s) => s.phase);
  const setPhase = useCourtStore((s) => s.setPhase);

  return (
    <div className="space-y-2">
      <span id="phase-label" className="text-sm font-medium">
        {strings.court.phaseGroup}
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        className="w-full"
        aria-labelledby="phase-label"
        value={phase}
        onValueChange={(value) => value && setPhase(value as CourtPhase)}
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
