import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

export const commonRoutes: RouteConfig[] = [
  // Default redirects
  {
    path: ROUTE_PATHS.ROOT,
    element: <Navigate to={ROUTE_PATHS.DASHBOARD} replace />,
  },
  {
    path: ROUTE_PATHS.WILDCARD,
    element: <Navigate to={ROUTE_PATHS.DASHBOARD} replace />,
  },
];