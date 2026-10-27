import { formationFor, useCourtStore } from '../state/courtStore';

/** The key idea of the formation on court, written in src/content/. */
export function FormationNote() {
  const rotation = useCourtStore((s) => s.rotation);
  const phase = useCourtStore((s) => s.phase);
  const note = formationFor(rotation, phase).note;

  if (!note) return null;
  return (
    <p className="formation-note" data-testid="formation-note">
      {note}
    </p>
  );
}
