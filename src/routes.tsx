import type { RouteObject } from 'react-router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { LessonsPage } from './pages/LessonsPage';
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
      { path: 'lessons', element: <LessonsPage /> },
      {
        path: 'lessons/:lessonId',
        lazy: async () => ({ Component: (await import('./pages/LessonPage')).LessonPage }),
      },
      {
        path: 'practice',
        lazy: async () => ({ Component: (await import('./pages/PracticePage')).PracticePage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
