import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCourtStore } from '../state/courtStore';
import { OpponentToggle } from './OpponentToggle';

describe('OpponentToggle', () => {
  beforeEach(() => {
    useCourtStore.getState().setShowOpponent(false);
    useCourtStore.getState().setPhase('base');
  });

  it('is off by default and disabled outside the receive phase', () => {
    render(<OpponentToggle />);
    const toggle = screen.getByRole('switch', { name: 'Show opponent' });
    expect(toggle).not.toBeChecked();
    expect(toggle).toBeDisabled();
    expect(screen.getByText('Available in the receive phase.')).toBeInTheDocument();
  });

  it('can be switched on in the receive phase', async () => {
    useCourtStore.getState().setPhase('receive');
    render(<OpponentToggle />);
    const toggle = screen.getByRole('switch', { name: 'Show opponent' });
    expect(toggle).toBeEnabled();
    await userEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(useCourtStore.getState().showOpponent).toBe(true);
  });
});
