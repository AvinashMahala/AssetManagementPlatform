import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded meter components
const MeterListPageEnhanced = lazy(() => import('../../features/meters/pages/MeterListPageEnhanced/MeterListPageEnhanced'));
const MeterCreatePageTabbed = lazy(() => import('../../features/meters/pages/MeterCreatePageTabbed/MeterCreatePageTabbed').then(module => ({ default: module.MeterCreatePageTabbed })));
const MeterEditPage = lazy(() => import('../../features/meters/pages/MeterEditPage/MeterEditPage').then(module => ({ default: module.MeterEditPage })));
const MeterDetailPage = lazy(() => import('../../features/meters/pages/MeterDetailPage/MeterDetailPage').then(module => ({ default: module.MeterDetailPage })));
const MeterReadingCreatePage = lazy(() => import('../../features/meters/pages/MeterReadingCreatePage/MeterReadingCreatePage').then(module => ({ default: module.MeterReadingCreatePage })));

export const metersRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.METERS,
    element: <MeterListPageEnhanced />,
    isProtected: true,
    requiredPermission: 'meters:meter:view'
  },
  {
    path: ROUTE_PATHS.METERS_CREATE,
    element: <MeterCreatePageTabbed />,
    isProtected: true,
    requiredPermission: 'meters:meter:create'
  },
  {
    path: ROUTE_PATHS.METERS_CREATE_TABBED,
    element: <MeterCreatePageTabbed />,
    isProtected: true,
    requiredPermission: 'meters:meter:create'
  },
  {
    path: ROUTE_PATHS.METER_DETAIL,
    element: <MeterDetailPage />,
    isProtected: true,
    requiredPermission: 'meters:meter:view'
  },
  {
    path: ROUTE_PATHS.METER_EDIT,
    element: <MeterEditPage />,
    isProtected: true,
    requiredPermission: 'meters:meter:update'
  },
  {
    path: ROUTE_PATHS.METER_READING_CREATE,
    element: <MeterReadingCreatePage />,
    isProtected: true,
    requiredPermission: 'meters:meter:update'
  },
];
