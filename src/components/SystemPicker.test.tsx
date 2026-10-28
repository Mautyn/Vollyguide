import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { System } from '../domain/types';
import { SystemPicker } from './SystemPicker';

function Harness() {
  const [system, setSystem] = useState<System>('5-1');
  return <SystemPicker value={system} onChange={setSystem} />;
}

describe('SystemPicker', () => {
  it('offers 5-1, 6-2 and 4-2 and explains the chosen system', async () => {
    render(<Harness />);
    const options = screen.getAllByRole('radio').map((r) => r.textContent);
    expect(options).toEqual(['5-1', '6-2', '4-2']);
    expect(screen.getByRole('radio', { name: '5-1' })).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(screen.getByRole('radio', { name: '4-2' }));
    expect(screen.getByRole('radio', { name: '4-2' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('system-hint')).toHaveTextContent(/front row sets from zone 3/);
  });
});
