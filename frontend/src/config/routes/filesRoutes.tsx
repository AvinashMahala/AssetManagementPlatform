import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded file components
const FilesPage = lazy(() => import('../../features/files').then(module => ({ default: module.FilesPage })));

export const filesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.FILES,
    element: <FilesPage />,
    isProtected: true,
  },
];