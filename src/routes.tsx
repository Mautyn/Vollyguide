import type { RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'court',
        // Konva is large; load it only on the court page.
        lazy: async () => ({ Component: (await import('./pages/CourtPage')).CourtPage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
