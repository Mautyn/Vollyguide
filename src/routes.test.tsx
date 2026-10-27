import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from './routes';

describe('routes under the GitHub Pages base path', () => {
  const basename = '/Vollyguide/';

  it('renders the home page at the base path and prefixes links with it', () => {
    const router = createMemoryRouter(routes, { basename, initialEntries: ['/Vollyguide/'] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole('link', { name: 'Open the court' })).toHaveAttribute(
      'href',
      '/Vollyguide/court',
    );
    expect(screen.getByRole('link', { name: 'Court' })).toHaveAttribute(
      'href',
      '/Vollyguide/court',
    );
  });

  it('routes deep links below the base path', () => {
    const router = createMemoryRouter(routes, {
      basename,
      initialEntries: ['/Vollyguide/no-such-page'],
    });
    render(<RouterProvider router={router} />);
    expect(screen.getByText('Page not found.')).toBeInTheDocument();
  });
});
