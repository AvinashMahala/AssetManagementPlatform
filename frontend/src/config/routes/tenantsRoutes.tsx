import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded tenant components
const TenantCreatePage = lazy(() => import('../../features/tenants/Create/TenantCreatePage'));
const TenantDetailPage = lazy(() => import('../../features/tenants/Detail/TenantDetailPage'));
const TenantEditPage = lazy(() => import('../../features/tenants/Edit/TenantEditPage'));
const TenantListPage = lazy(() => import('../../features/tenants/List/TenantListPage'));
const TenantDashboardPage = lazy(() => import('../../features/tenants/Dashboard/TenantDashboardPage').then(module => ({ default: module.TenantDashboardPage })));

export const tenantsRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.TENANTS,
    element: <TenantListPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TENANTS_CREATE,
    element: <Navigate to={ROUTE_PATHS.TENANTS_CREATE_TABBED} replace />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TENANTS_CREATE_TABBED,
    element: <AppLayout><TenantCreatePage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TENANT_DETAIL,
    element: <AppLayout><TenantDetailPage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TENANT_DASHBOARD,
    element: <TenantDashboardPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TENANT_EDIT,
    element: <TenantEditPage />,
    isProtected: true,
  },
];
