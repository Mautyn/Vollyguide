import { useCourtStore, type CourtPhase } from '../state/courtStore';
import { strings } from '../strings';

const PHASES: readonly CourtPhase[] = ['base', 'receive'];

export function PhasePicker() {
  const phase = useCourtStore((s) => s.phase);
  const setPhase = useCourtStore((s) => s.setPhase);

  return (
    <fieldset className="toggle-group">
      <legend>{strings.court.phaseGroup}</legend>
      <div className="toggle-group__buttons">
        {PHASES.map((p) => (
          <button key={p} type="button" aria-pressed={p === phase} onClick={() => setPhase(p)}>
            {strings.court.phases[p]}
          </button>
        ))}
      </div>
      <p className="toggle-group__hint">{strings.court.phaseHint}</p>
    </fieldset>
  );
}
