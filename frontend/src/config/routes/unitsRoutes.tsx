import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded unit components
const UnitCreatePage = lazy(() => import('../../features/units/Create/UnitCreatePage').then(module => ({ default: module.UnitCreatePageTabbed })));
const UnitDetailPage = lazy(() => import('../../features/units/Detail/UnitDetailPage').then(module => ({ default: module.UnitDetailPage })));
const UnitDashboardPage = lazy(() => import('../../features/units/Dashboard/UnitDashboardPage').then(module => ({ default: module.UnitDashboardPage })));
const UnitEditPage = lazy(() => import('../../features/units/Edit/UnitEditPage').then(module => ({ default: module.UnitEditPage })));
const UnitListPage = lazy(() => import('../../features/units/List/UnitListPage'));

export const unitsRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.UNITS,
    element: <UnitListPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNITS_CREATE,
    element: <AppLayout><UnitCreatePage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNITS_CREATE_TABBED,
    element: <AppLayout><UnitCreatePage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNIT_DETAIL,
    element: <AppLayout><UnitDetailPage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNIT_DASHBOARD,
    element: <AppLayout><UnitDashboardPage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNIT_EDIT,
    element: <UnitEditPage />,
    isProtected: true,
  },
];
