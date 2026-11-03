import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '../routes';

describe('HomePage', () => {
  it('links to the court page', () => {
    render(<RouterProvider router={createMemoryRouter(routes)} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/positioning/i);
    expect(screen.getByRole('link', { name: 'Open the court' })).toHaveAttribute('href', '/court');
  });

  it('does not link to the hidden Lessons section (#58)', () => {
    render(<RouterProvider router={createMemoryRouter(routes)} />);
    expect(screen.queryByRole('link', { name: 'Browse lessons' })).not.toBeInTheDocument();
    expect(screen.getByRole('navigation')).not.toHaveTextContent('Lessons');
  });

  it('still opens a lesson by its URL', async () => {
    render(
      <RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/lessons'] })} />,
    );
    expect(await screen.findByRole('heading', { name: 'Lessons', level: 1 })).toBeVisible();
  });
});
