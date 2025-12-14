import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded file components
const FilesPageEnhanced = lazy(() => import('../../pages/FilesPageEnhanced'));

export const filesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.FILES,
    element: <FilesPageEnhanced />,
    isProtected: true,
  },
];