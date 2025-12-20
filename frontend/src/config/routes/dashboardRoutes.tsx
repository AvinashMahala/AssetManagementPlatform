import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded dashboard components
import DashboardEnhanced from '../../features/dashboard/DashboardEnhanced/DashboardEnhanced';
const NavigationConfigPage = lazy(() => import('../../features/admin/pages/NavigationConfigPage'));

export const dashboardRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.DASHBOARD,
    element: <DashboardEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.NAVIGATION_CONFIG,
    element: <NavigationConfigPage />,
    isProtected: true,
  },
];