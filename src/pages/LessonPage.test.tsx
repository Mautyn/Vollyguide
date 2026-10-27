import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { routes } from '../routes';

// Konva needs a real canvas; the court itself is covered by E2E tests.
vi.mock('../court/CourtStage', () => ({
  CourtStage: ({ highlight }: { highlight?: string[] }) => (
    <div data-testid="court-stage" data-highlight={(highlight ?? []).join(',')} />
  ),
}));

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('LessonPage', () => {
  it('renders the step given in ?step=', async () => {
    renderAt('/lessons/overlap-rule?step=2');
    expect(await screen.findByRole('heading', { name: 'Front against back' })).toBeInTheDocument();
    expect(screen.getByTestId('step-counter')).toHaveTextContent('Step 2 of 6');
    expect(screen.getByTestId('court-stage')).toHaveAttribute('data-highlight', 'opp,oh2');
    expect(screen.getByRole('button', { name: 'Go to step 2' })).toHaveAttribute(
      'aria-current',
      'step',
    );
  });

  it('starts at step 1 without a step parameter', async () => {
    renderAt('/lessons/overlap-rule');
    expect(await screen.findByRole('heading', { name: 'When the rule applies' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  });

  it('Next and Previous change the step and the URL', async () => {
    const router = renderAt('/lessons/overlap-rule?step=1');
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Front against back' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?step=2');

    await userEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByRole('heading', { name: 'When the rule applies' })).toBeInTheDocument();
    expect(router.state.location.search).toBe('?step=1');
  });

  it('shows the overlap fault on an illegal example and a way back on the last step', async () => {
    renderAt('/lessons/overlap-rule?step=6');
    expect(await screen.findByRole('status')).toHaveTextContent('Zone 5 must be left of zone 6.');
    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to lessons' })).toHaveAttribute(
      'href',
      '/lessons',
    );
  });

  it('shows the not-found page for an unknown lesson', async () => {
    renderAt('/lessons/no-such-lesson');
    expect(await screen.findByText('Page not found.')).toBeInTheDocument();
  });
});

describe('LessonsPage', () => {
  it('lists every lesson with a link', async () => {
    renderAt('/lessons');
    await screen.findByRole('heading', { name: 'Lessons', level: 1 });
    const hrefs = screen
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
      .filter((href) => href?.startsWith('/lessons/'));
    expect(hrefs).toEqual([
      '/lessons/court-zones-rotation',
      '/lessons/overlap-rule',
      '/lessons/5-1-serve-receive',
    ]);
  });
});
