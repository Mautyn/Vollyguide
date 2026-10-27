import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCourtStore } from '../state/courtStore';
import { FormationNote } from './FormationNote';
import { PhasePicker } from './PhasePicker';
import { PlayerList } from './PlayerList';

function Harness() {
  const players = useCourtStore((s) => s.players);
  return (
    <>
      <PhasePicker />
      <FormationNote />
      <PlayerList players={players} />
    </>
  );
}

describe('PhasePicker', () => {
  beforeEach(() => {
    useCourtStore.getState().setPhase('base');
    useCourtStore.getState().setRotation(1);
  });

  it('starts on Base without a note', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Base' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByTestId('formation-note')).not.toBeInTheDocument();
  });

  it('switching to Receive shows the receive positions and the rotation note', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Receive' }));
    expect(screen.getByRole('button', { name: 'Receive' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByTestId('player')[0]).toHaveTextContent('S Setter: x 8.5 m, y 3.5 m');
    expect(screen.getByTestId('formation-note')).toHaveTextContent(/Setter in 1/);
  });
});
