import { ChevronLeft, ChevronRight } from 'lucide-react';
import { nextRotation, previousRotation, ROTATION_ORDER } from '../content/rotations';
import type { Rotation } from '../domain/types';
import { useCourtStore } from '../state/courtStore';
import { strings } from '../strings';
import { Button } from './ui/button';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

export function RotationPicker() {
  const rotation = useCourtStore((s) => s.rotation);
  const setRotation = useCourtStore((s) => s.setRotation);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span id="rotation-label" className="text-sm font-medium">
          {strings.court.rotationGroup}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={strings.court.previousRotation}
            onClick={() => setRotation(previousRotation(rotation))}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={strings.court.nextRotation}
            onClick={() => setRotation(nextRotation(rotation))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <ToggleGroup
        type="single"
        variant="outline"
        className="w-full"
        aria-labelledby="rotation-label"
        value={String(rotation)}
        onValueChange={(value) => value && setRotation(Number(value) as Rotation)}
      >
        {ROTATION_ORDER.map((r) => (
          <ToggleGroupItem key={r} value={String(r)} aria-label={strings.court.rotation(r)}>
            {r}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground">{strings.court.rotationHint}</p>
    </div>
  );
}
