import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded tenant components
const TenantCreatePageTabbedEnhanced = lazy(() => import('../../pages/tenants/TenantCreatePageTabbedEnhanced'));
const TenantDetailPage = lazy(() => import('../../pages/tenants/TenantDetailPage'));
const TenantEditPage = lazy(() => import('../../pages/tenants/TenantEditPage'));
const TenantListPageEnhanced = lazy(() => import('../../pages/tenants/TenantListPageEnhanced'));
const TenantDashboardPage = lazy(() => import('../../pages/tenants/TenantDashboardPage').then(module => ({ default: module.TenantDashboardPage })));

export const tenantsRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.TENANTS,
    element: <TenantListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TENANTS_CREATE,
    element: <Navigate to={ROUTE_PATHS.TENANTS_CREATE_TABBED} replace />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TENANTS_CREATE_TABBED,
    element: <TenantCreatePageTabbedEnhanced />,
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