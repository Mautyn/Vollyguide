import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePracticeStore } from '../state/practiceStore';
import { usePreferences } from '../state/preferences';
import { PracticePage } from './PracticePage';

// Konva needs a real canvas; the court itself is covered by E2E tests.
vi.mock('../court/CourtStage', () => ({
  CourtStage: ({ marks }: { marks?: Record<string, string> }) => (
    <div data-testid="court-stage" data-marks={JSON.stringify(marks ?? null)} />
  ),
}));

describe('PracticePage', () => {
  // These tests cover the six-player lineup; the libero has its own tests.
  beforeEach(() => {
    usePreferences.getState().setUseLibero(false);
    usePracticeStore.getState().setTask(1, 'base');
  });

  it('shows no result before checking', () => {
    render(<PracticePage />);
    expect(screen.queryByTestId('practice-result')).not.toBeInTheDocument();
    expect(screen.getByTestId('court-stage')).toHaveAttribute('data-marks', 'null');
  });

  it('grades the bench, then the shown answer', async () => {
    render(<PracticePage />);
    await userEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByTestId('practice-result')).toHaveTextContent(
      '0 of 6 correct, lineup illegal',
    );
    expect(screen.getAllByTestId('grade')[0]).toHaveTextContent(/m off$/);

    await userEvent.click(screen.getByRole('button', { name: 'Show answer' }));
    expect(screen.queryByTestId('practice-result')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByTestId('practice-result')).toHaveTextContent('6 of 6 correct, lineup legal');
    expect(screen.getByRole('status')).toHaveTextContent(/legal/);
    expect(JSON.parse(screen.getByTestId('court-stage').getAttribute('data-marks')!)).toEqual({
      s: 'correct',
      oh1: 'correct',
      mb2: 'correct',
      opp: 'correct',
      oh2: 'correct',
      mb1: 'correct',
    });
  });

  it('changes the task with the pickers and with Random task', async () => {
    render(<PracticePage />);
    await userEvent.click(screen.getByRole('radio', { name: 'Rotation 4' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Receive' }));
    expect(screen.getByTestId('practice-task')).toHaveTextContent('5-1, rotation 4, receive');

    await userEvent.click(screen.getByRole('button', { name: 'Random task' }));
    expect(screen.getByTestId('practice-task')).not.toHaveTextContent('5-1, rotation 4, receive');
  });
});
