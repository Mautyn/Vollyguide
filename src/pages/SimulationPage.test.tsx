import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePreferences } from '../state/preferences';
import { SimulationPage } from './SimulationPage';

// Konva needs a real canvas; the court itself is covered by E2E tests.
vi.mock('../court/CourtStage', () => ({
  CourtStage: () => <div data-testid="court-stage" />,
}));

const click = (name: string) => userEvent.click(screen.getByRole('button', { name }));
const score = () => screen.getByTestId('score').textContent;
const serverName = () => screen.getByTestId('sim-server').textContent;

describe('SimulationPage, step by step', () => {
  beforeEach(() => usePreferences.getState().setUseLibero(true));

  it('starts with the opponent serving and offers our attacks', () => {
    render(<SimulationPage />);
    expect(score()).toBe('0–0');
    expect(serverName()).toBe('their S');
    expect(screen.getByTestId('our-rotation')).toHaveTextContent('1');
    const controls = within(screen.getByTestId('step-controls'));
    expect(controls.getByRole('heading', { name: 'Our next action' })).toBeVisible();
    for (const name of [
      'Outside (zone 4)',
      'Middle quick',
      'Right side (zone 2)',
      'Pipe (back row)',
    ]) {
      expect(controls.getByRole('button', { name })).toBeVisible();
    }
    // A result can be chosen only after the first action.
    expect(controls.queryByRole('button', { name: 'Point for us' })).not.toBeInTheDocument();
  });

  it('a side-out rotates us and changes the server', async () => {
    render(<SimulationPage />);
    await click('Outside (zone 4)');
    await click('Point for us');
    expect(score()).toBe('1–0');
    expect(screen.getByTestId('our-rotation')).toHaveTextContent('6');
    expect(serverName()).toBe('OH1');
    expect(screen.getByTestId('rally-log')).toHaveTextContent(
      'Rally 1: Point for us: 1–0. Side-out: we rotate to rotation 6. OH1 serves next.',
    );
    await click('Next rally');
    // Now we serve, so the opponent acts first.
    expect(screen.getByRole('heading', { name: 'Their next action' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Free ball' })).toBeVisible();
  });

  it('winning our own serve keeps the server and the rotation', async () => {
    render(<SimulationPage />);
    await userEvent.click(screen.getByRole('radio', { name: 'We serve' }));
    expect(serverName()).toBe('S');
    await click('Attack from their left');
    expect(screen.getByRole('heading', { name: 'Our next action' })).toBeVisible();
    await click('Pipe (back row)');
    await click('Point for us');
    expect(score()).toBe('1–0');
    expect(serverName()).toBe('S');
    expect(screen.getByTestId('our-rotation')).toHaveTextContent('1');
  });

  it('losing on their serve keeps their server', async () => {
    render(<SimulationPage />);
    await click('Outside (zone 4)');
    await click('Point for them');
    expect(score()).toBe('0–1');
    expect(serverName()).toBe('their S');
  });

  it('offers no middle quick in a 4-2', async () => {
    render(<SimulationPage />);
    await userEvent.click(screen.getByRole('radio', { name: '4-2' }));
    expect(screen.queryByRole('button', { name: 'Middle quick' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Outside (zone 4)' })).toBeVisible();
  });

  it('starts a new match when a setting changes', async () => {
    render(<SimulationPage />);
    await click('Outside (zone 4)');
    await click('Point for us');
    await userEvent.click(screen.getByRole('radio', { name: 'Rotation 4' }));
    expect(score()).toBe('0–0');
    expect(screen.getByTestId('our-rotation')).toHaveTextContent('4');
    expect(screen.queryByTestId('rally-log')).not.toBeInTheDocument();
  });
});

describe('SimulationPage, automatic tour', () => {
  it('steps through the rallies with the scoreboard and the log', async () => {
    render(<SimulationPage />);
    await userEvent.click(screen.getByRole('radio', { name: 'Automatic tour' }));
    expect(screen.getByTestId('tour-rally')).toHaveTextContent('Rally 1 of 13');
    expect(screen.getByRole('button', { name: 'Previous rally' })).toBeDisabled();
    expect(screen.queryByRole('radio', { name: 'Rotation 1' })).not.toBeInTheDocument();
    await click('Next rally');
    expect(screen.getByTestId('tour-rally')).toHaveTextContent('Rally 2 of 13');
    expect(score()).toBe('1–0');
    expect(screen.getByTestId('rally-log')).toHaveTextContent('Rally 1: Point for us: 1–0.');
  });
});
