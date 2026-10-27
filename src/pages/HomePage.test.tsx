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
});
