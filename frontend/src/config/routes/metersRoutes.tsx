import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded meter components
const MeterListPageEnhanced = lazy(() => import('../../pages/meters/MeterListPageEnhanced'));
const MeterCreatePageTabbedEnhanced = lazy(() => import('../../pages/meters/MeterCreatePageTabbedEnhanced'));
const MeterEditPage = lazy(() => import('../../pages/meters/MeterEditPage').then(module => ({ default: module.MeterEditPage })));
const MeterDetailPage = lazy(() => import('../../pages/meters/MeterDetailPage').then(module => ({ default: module.MeterDetailPage })));
const MeterReadingCreatePage = lazy(() => import('../../pages/meters/MeterReadingCreatePage').then(module => ({ default: module.MeterReadingCreatePage })));

export const metersRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.METERS,
    element: <MeterListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.METERS_CREATE,
    element: <MeterCreatePageTabbedEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.METERS_CREATE_TABBED,
    element: <MeterCreatePageTabbedEnhanced />,
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