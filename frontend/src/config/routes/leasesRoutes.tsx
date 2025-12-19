import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded lease components
const LeaseCreatePageTabbedEnhanced = lazy(() => import('../../features/leases/pages/LeaseCreatePage'));
const LeaseDetailPage = lazy(() => import('../../features/leases/pages/LeaseDetailPage').then(module => ({ default: module.LeaseDetailPage })));
const LeaseEditPage = lazy(() => import('../../features/leases/pages/LeaseEditPage').then(module => ({ default: module.LeaseEditPage })));
const LeaseListPageEnhanced = lazy(() => import('../../features/leases/pages/LeaseListPage'));

export const leasesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.LEASES,
    element: <LeaseListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.LEASES_CREATE,
    element: <Navigate to={ROUTE_PATHS.LEASES_CREATE_TABBED} replace />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.LEASES_CREATE_TABBED,
    element: <LeaseCreatePageTabbedEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.LEASE_DETAIL,
    element: <AppLayout><LeaseDetailPage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.LEASE_EDIT,
    element: <LeaseEditPage />,
    isProtected: true,
  },
];