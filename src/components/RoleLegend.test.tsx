import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RoleLegend } from './RoleLegend';

describe('RoleLegend', () => {
  it('lists only the roles on court, in a fixed order', () => {
    render(<RoleLegend roles={['MB', 'S', 'OH', 'MB']} />);
    const items = screen.getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['Setter', 'Outside hitter', 'Middle blocker']);
  });
});
