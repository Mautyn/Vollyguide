import { ArrowRightLeft, Undo2 } from 'lucide-react';
import { useCourtStore } from '../state/courtStore';
import { strings } from '../strings';
import { Button } from './ui/button';

/** Serve phase only: animates the switch to defense, and back to the moment of serve. */
export function ServeSwitch() {
  const visible = useCourtStore((s) => s.phase === 'serve');
  const switched = useCourtStore((s) => s.switched);
  const switchToDefense = useCourtStore((s) => s.switchToDefense);
  const reset = useCourtStore((s) => s.reset);

  if (!visible) return null;
  return (
    <div className="space-y-1.5">
      {switched ? (
        <Button variant="outline" className="w-full" onClick={reset}>
          <Undo2 aria-hidden />
          {strings.court.backToServe}
        </Button>
      ) : (
        <Button className="w-full" onClick={switchToDefense}>
          <ArrowRightLeft aria-hidden />
          {strings.court.switchToDefense}
        </Button>
      )}
      <p className="text-xs text-muted-foreground">{strings.court.switchHint}</p>
    </div>
  );
}
