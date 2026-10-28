import { useId } from 'react';
import { SYSTEMS } from '../content/systems';
import type { System } from '../domain/types';
import { strings } from '../strings';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

interface SystemPickerProps {
  value: System;
  onChange: (system: System) => void;
}

export function SystemPicker({ value, onChange }: SystemPickerProps) {
  const labelId = useId();
  return (
    <div className="space-y-2">
      <span id={labelId} className="text-sm font-medium">
        {strings.court.systemGroup}
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        className="w-full"
        aria-labelledby={labelId}
        value={value}
        onValueChange={(next) => next && onChange(next as System)}
      >
        {SYSTEMS.map((system) => (
          <ToggleGroupItem key={system} value={system}>
            {system}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <p className="text-xs text-muted-foreground" data-testid="system-hint">
        {strings.court.systemHints[value]}
      </p>
    </div>
  );
}
