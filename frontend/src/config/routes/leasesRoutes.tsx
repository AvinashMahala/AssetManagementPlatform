import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded lease components
const LeaseCreatePageTabbedEnhanced = lazy(() => import('../../features/leases/pages/LeaseCreatePage/LeaseCreatePage'));
const LeaseDetailPage = lazy(() => import('../../features/leases/pages/LeaseDetailPage/LeaseDetailPage').then(module => ({ default: module.LeaseDetailPage })));
const LeaseEditPage = lazy(() => import('../../features/leases/pages/LeaseEditPage/LeaseEditPage').then(module => ({ default: module.LeaseEditPage })));
const LeaseListPageEnhanced = lazy(() => import('../../features/leases/pages/LeaseListPage/LeaseListPage'));

export const leasesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.LEASES,
    element: <LeaseListPageEnhanced />,
    isProtected: true,
    requiredPermission: 'leases:lease:view'
  },
  // Backwards-compat redirect from old '/leases/new' to canonical create route
  {
    path: '/leases/new',
    element: <Navigate to={ROUTE_PATHS.LEASES_CREATE_TABBED} replace />,
    isProtected: true,
    requiredPermission: 'leases:lease:create'
  },
  {
    path: ROUTE_PATHS.LEASES_CREATE,
    element: <Navigate to={ROUTE_PATHS.LEASES_CREATE_TABBED} replace />,
    isProtected: true,
    requiredPermission: 'leases:lease:create'
  },
  {
    path: ROUTE_PATHS.LEASES_CREATE_TABBED,
    element: <LeaseCreatePageTabbedEnhanced />,
    isProtected: true,
    requiredPermission: 'leases:lease:create'
  },
  {
    path: ROUTE_PATHS.LEASE_DETAIL,
    element: <AppLayout><LeaseDetailPage /></AppLayout>,
    isProtected: true,
    requiredPermission: 'leases:lease:view'
  },
  {
    path: ROUTE_PATHS.LEASE_EDIT,
    element: <LeaseEditPage />,
    isProtected: true,
    requiredPermission: 'leases:lease:update'
  },
];