import { useId } from 'react';
import { useCourtStore } from '../state/courtStore';
import { strings } from '../strings';
import { Switch } from './ui/switch';

/** "Show opponent" switch; the opponent is only shown in the receive phase. */
export function OpponentToggle() {
  const showOpponent = useCourtStore((s) => s.showOpponent);
  const setShowOpponent = useCourtStore((s) => s.setShowOpponent);
  const available = useCourtStore((s) => s.phase === 'receive');
  const id = useId();

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className={
            available ? 'text-sm font-medium' : 'text-sm font-medium text-muted-foreground'
          }
        >
          {strings.court.showOpponent}
        </label>
        <Switch
          id={id}
          checked={available && showOpponent}
          disabled={!available}
          onCheckedChange={setShowOpponent}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {available ? strings.court.opponentHint : strings.court.opponentOnlyInReceive}
      </p>
    </div>
  );
}
