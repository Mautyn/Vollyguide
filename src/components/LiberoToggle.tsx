import { useId } from 'react';
import { usePreferences } from '../state/preferences';
import { strings } from '../strings';
import { Switch } from './ui/switch';

export function LiberoToggle() {
  const useLibero = usePreferences((s) => s.useLibero);
  const setUseLibero = usePreferences((s) => s.setUseLibero);
  const id = useId();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {strings.court.useLibero}
        </label>
        <Switch id={id} checked={useLibero} onCheckedChange={setUseLibero} />
      </div>
      <p className="text-xs text-muted-foreground">{strings.court.liberoHint}</p>
    </div>
  );
}
