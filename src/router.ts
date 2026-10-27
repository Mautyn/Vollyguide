import { createBrowserRouter } from 'react-router';
import { routes } from './routes';

/** Vite's base path ("/" in dev, "/Vollyguide/" in the production build). */
export const basename = import.meta.env.BASE_URL;

export function createAppRouter() {
  return createBrowserRouter(routes, { basename });
}
