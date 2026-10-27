import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BASE_5_1_ROTATION_1, formationToPlayers } from '../content/formations';
import { PlayerList } from './PlayerList';

describe('PlayerList', () => {
  it('shows every player with their position in meters', () => {
    render(<PlayerList players={formationToPlayers(BASE_5_1_ROTATION_1)} />);
    const items = screen.getAllByTestId('player');
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveTextContent('S Setter 7.5 m from left · 6.0 m from net');
  });
});
