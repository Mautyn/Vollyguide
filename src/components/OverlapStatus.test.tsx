import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BASE_SPOTS } from '../content/formations';
import { OverlapStatus } from './OverlapStatus';

describe('OverlapStatus', () => {
  it('reports a legal lineup', () => {
    render(<OverlapStatus lineup={BASE_SPOTS} />);
    expect(screen.getByRole('status')).toHaveTextContent(/legal/i);
  });

  it('lists each overlap fault', () => {
    render(<OverlapStatus lineup={{ ...BASE_SPOTS, 1: { x: 7.5, y: 8 } }} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Zone 2 must be closer to the net than zone 1.',
    );
  });
});
