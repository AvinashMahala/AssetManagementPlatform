import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded meter components
const MeterListPageEnhanced = lazy(() => import('../../features/meters/pages/MeterListPageEnhanced'));
const MeterCreatePageTabbed = lazy(() => import('../../features/meters/pages/MeterCreatePageTabbed').then(module => ({ default: module.MeterCreatePageTabbed })));
const MeterEditPage = lazy(() => import('../../features/meters/pages/MeterEditPage').then(module => ({ default: module.MeterEditPage })));
const MeterDetailPage = lazy(() => import('../../features/meters/pages/MeterDetailPage').then(module => ({ default: module.MeterDetailPage })));
const MeterReadingCreatePage = lazy(() => import('../../features/meters/pages/MeterReadingCreatePage').then(module => ({ default: module.MeterReadingCreatePage })));

export const metersRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.METERS,
    element: <MeterListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.METERS_CREATE,
    element: <MeterCreatePageTabbed />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.METERS_CREATE_TABBED,
    element: <MeterCreatePageTabbed />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.METER_DETAIL,
    element: <MeterDetailPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.METER_EDIT,
    element: <MeterEditPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.METER_READING_CREATE,
    element: <MeterReadingCreatePage />,
    isProtected: true,
  },
];
