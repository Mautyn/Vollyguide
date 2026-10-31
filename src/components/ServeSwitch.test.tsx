import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCourtStore, type CourtPhase } from '../state/courtStore';
import { usePreferences } from '../state/preferences';
import { FormationNote } from './FormationNote';
import { PhasePicker } from './PhasePicker';
import { PlayerList } from './PlayerList';
import { ServeSwitch } from './ServeSwitch';

const PHASES: readonly CourtPhase[] = ['base', 'serve', 'receive'];

function Harness() {
  const players = useCourtStore((s) => s.players);
  const benchIds = useCourtStore((s) => s.benchIds);
  const phase = useCourtStore((s) => s.phase);
  const setPhase = useCourtStore((s) => s.setPhase);
  return (
    <>
      <PhasePicker value={phase} onChange={setPhase} phases={PHASES} />
      <ServeSwitch />
      <FormationNote />
      <PlayerList players={players} benchIds={benchIds} />
    </>
  );
}

const row = (label: string) =>
  screen.getAllByTestId('player').find((el) => el.textContent?.startsWith(`${label} `))!;

describe('Serve phase', () => {
  beforeEach(() => {
    usePreferences.getState().setUseLibero(false);
    useCourtStore.getState().setSystem('5-1');
    useCourtStore.getState().setRotation(1);
    useCourtStore.getState().setPhase('base');
  });

  it('hides the Switch control outside the serve phase', () => {
    render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Switch' })).not.toBeInTheDocument();
  });

  it('shows the server behind the end line, then switches everyone to defense and back', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: 'Serve' }));
    expect(screen.getByTestId('formation-note')).toHaveTextContent(/zone-1 player serves/);
    // Rotation 1: the setter is in zone 1 and serves from 1 m behind the end line.
    expect(row('S')).toHaveTextContent('S Setter 7.5 m from left · 10.0 m from net');
    expect(row('OPP')).toHaveTextContent('OPP Opposite 1.5 m from left · 1.5 m from net');

    await userEvent.click(screen.getByRole('button', { name: 'Switch' }));
    expect(useCourtStore.getState().switched).toBe(true);
    expect(row('S')).toHaveTextContent('S Setter 8.0 m from left · 6.0 m from net');
    expect(row('OPP')).toHaveTextContent('OPP Opposite 7.5 m from left · 0.6 m from net');
    expect(row('OH1')).toHaveTextContent('OH1 Outside hitter 1.5 m from left · 0.6 m from net');

    await userEvent.click(screen.getByRole('button', { name: 'Back to serve' }));
    expect(useCourtStore.getState().switched).toBe(false);
    expect(row('S')).toHaveTextContent('S Setter 7.5 m from left · 10.0 m from net');
  });

  it('with the libero on, the libero serves for MB1 and MB2 serves its own turn', async () => {
    usePreferences.getState().setUseLibero(true);
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: 'Serve' }));

    // Rotation 2: MB1 is in zone 1, so the libero serves and MB1 is on the bench.
    act(() => useCourtStore.getState().setRotation(2));
    expect(row('L')).toHaveTextContent('L Libero 7.5 m from left · 10.0 m from net');
    expect(row('MB1')).toHaveTextContent('Bench');

    // Rotation 5: MB2 is in zone 1 and serves; the libero waits on the bench.
    act(() => useCourtStore.getState().setRotation(5));
    expect(row('MB2')).toHaveTextContent('MB2 Middle blocker 7.5 m from left · 10.0 m from net');
    expect(row('L')).toHaveTextContent('Bench');
  });
});
