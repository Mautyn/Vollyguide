import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCourtStore } from '../state/courtStore';
import { PlayerList } from './PlayerList';
import { RotationPicker } from './RotationPicker';

function Harness() {
  const players = useCourtStore((s) => s.players);
  return (
    <>
      <RotationPicker />
      <PlayerList players={players} />
    </>
  );
}

const setterText = () => screen.getAllByTestId('player')[0]?.textContent;

describe('RotationPicker', () => {
  beforeEach(() => useCourtStore.getState().setRotation(1));

  it('lists the rotations in playing order and marks the active one', () => {
    render(<RotationPicker />);
    const buttons = screen.getAllByRole('button', { name: /^Rotation \d$/ });
    expect(buttons.map((b) => b.textContent)).toEqual(['1', '6', '5', '4', '3', '2']);
    expect(screen.getByRole('button', { name: 'Rotation 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Rotation 6' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('picking rotation 4 puts the setter in zone 4', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Rotation 4' }));
    expect(setterText()).toBe('S Setter: x 1.5 m, y 7.5 m');
    expect(screen.getByRole('button', { name: 'Rotation 4' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('next and previous follow the playing order', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Next rotation' }));
    expect(useCourtStore.getState().rotation).toBe(6);
    expect(setterText()).toBe('S Setter: x 4.5 m, y 3.0 m');
    await userEvent.click(screen.getByRole('button', { name: 'Previous rotation' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous rotation' }));
    expect(useCourtStore.getState().rotation).toBe(2);
  });
});
