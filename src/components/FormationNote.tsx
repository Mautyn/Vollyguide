import { Lightbulb } from 'lucide-react';
import { localizeNote } from '../content/i18n/localize';
import { formationFor, useCourtStore } from '../state/courtStore';
import { useLocale } from '../state/localeStore';

/** The key idea of the formation on court, written in src/content/. */
export function FormationNote() {
  const system = useCourtStore((s) => s.system);
  const rotation = useCourtStore((s) => s.rotation);
  const phase = useCourtStore((s) => s.phase);
  const locale = useLocale();
  const note = localizeNote(formationFor(system, rotation, phase), locale);

  if (!note) return null;
  return (
    <p
      className="flex gap-2.5 rounded-lg border border-primary/20 bg-accent/60 px-3 py-2.5 text-sm text-accent-foreground"
      data-testid="formation-note"
    >
      <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <span>{note}</span>
    </p>
  );
}
