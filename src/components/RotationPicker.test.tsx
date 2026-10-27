import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCourtStore } from '../state/courtStore';
import { PlayerList } from './PlayerList';
import { RotationPicker } from './RotationPicker';

function ConnectedRotationPicker() {
  const value = useCourtStore((s) => s.rotation);
  const onChange = useCourtStore((s) => s.setRotation);
  return <RotationPicker value={value} onChange={onChange} />;
}

function Harness() {
  const players = useCourtStore((s) => s.players);
  return (
    <>
      <ConnectedRotationPicker />
      <PlayerList players={players} />
    </>
  );
}

const setterText = () => screen.getAllByTestId('player')[0]?.textContent;

describe('RotationPicker', () => {
  beforeEach(() => {
    useCourtStore.getState().setPhase('base');
    useCourtStore.getState().setRotation(1);
  });

  it('lists the rotations in playing order and marks the active one', () => {
    render(<ConnectedRotationPicker />);
    const buttons = screen.getAllByRole('radio', { name: /^Rotation \d$/ });
    expect(buttons.map((b) => b.textContent)).toEqual(['1', '6', '5', '4', '3', '2']);
    expect(screen.getByRole('radio', { name: 'Rotation 1' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: 'Rotation 6' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('picking rotation 4 puts the setter in zone 4', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('radio', { name: 'Rotation 4' }));
    expect(setterText()).toBe('S Setter 1.5 m from left · 1.5 m from net');
    expect(screen.getByRole('radio', { name: 'Rotation 4' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('next and previous follow the playing order', async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Next rotation' }));
    expect(useCourtStore.getState().rotation).toBe(6);
    expect(setterText()).toBe('S Setter 4.5 m from left · 6.0 m from net');
    await userEvent.click(screen.getByRole('button', { name: 'Previous rotation' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous rotation' }));
    expect(useCourtStore.getState().rotation).toBe(2);
  });
});
