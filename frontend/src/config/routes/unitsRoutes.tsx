import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded unit components
const UnitCreatePageTabbedEnhanced = lazy(() => import('../../pages/units/UnitCreatePageTabbedEnhanced/UnitCreatePageTabbedEnhanced'));
const UnitDetailPage = lazy(() => import('../../pages/units/UnitDetailPage/UnitDetailPage').then(module => ({ default: module.UnitDetailPage })));
const UnitDashboardPage = lazy(() => import('../../pages/units/UnitDashboardPage/UnitDashboardPage').then(module => ({ default: module.UnitDashboardPage })));
const UnitEditPage = lazy(() => import('../../pages/units/UnitEditPage/UnitEditPage').then(module => ({ default: module.UnitEditPage })));
const UnitListPageEnhanced = lazy(() => import('../../pages/units/UnitListPageEnhanced/UnitListPageEnhanced'));

export const unitsRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.UNITS,
    element: <UnitListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNITS_CREATE,
    element: <UnitCreatePageTabbedEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNITS_CREATE_TABBED,
    element: <UnitCreatePageTabbedEnhanced />,
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