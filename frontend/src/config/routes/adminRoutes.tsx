import React from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

const RolesList = React.lazy(() => import('../../features/admin/pages/RolesList').then(m => ({ default: m.RolesList })));
const RoleEdit = React.lazy(() => import('../../features/admin/pages/RoleEdit').then(m => ({ default: m.RoleEdit })));
const AdminHub = React.lazy(() => import('../../features/admin/pages/AdminHub').then(m => ({ default: m.AdminHub })));
const PermissionsList = React.lazy(() => import('../../features/admin/pages/PermissionsList').then(m => ({ default: m.PermissionsList })));
const UsersList = React.lazy(() => import('../../features/admin/pages/UsersList').then(m => ({ default: m.UsersList })));
const AdminAudit = React.lazy(() => import('../../features/admin/pages/AdminAudit').then(m => ({ default: m.AdminAudit })));
const ExportTokens = React.lazy(() => import('../../features/admin/pages/ExportTokens').then(m => ({ default: m.ExportTokens })));

export const adminRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.ADMIN,
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <AdminHub />
      </React.Suspense>
    ),
  },
  {
    path: ROUTE_PATHS.ADMIN_ROLES,
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <RolesList />
      </React.Suspense>
    ),
    isProtected: true,
    requiredPermission: 'admin:roles:view',
  },
  {
    path: ROUTE_PATHS.ADMIN_ROLE_EDIT,
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <RoleEdit />
      </React.Suspense>
    ),
    isProtected: true,
    requiredPermission: 'admin:roles:update',
  },
  {
    path: ROUTE_PATHS.ADMIN_PERMISSIONS,
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <PermissionsList />
      </React.Suspense>
    ),
    isProtected: true,
    requiredPermission: 'admin:roles:view',
  },
  {
    path: ROUTE_PATHS.ADMIN_USERS,
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <UsersList />
      </React.Suspense>
    ),
    isProtected: true,
    requiredPermission: 'admin:roles:search_users',
  },
  {
    path: ROUTE_PATHS.ADMIN_AUDIT,
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <AdminAudit />
      </React.Suspense>
    ),
    isProtected: true,
    requiredPermission: 'admin:roles:view',
  },
  {
    path: ROUTE_PATHS.ADMIN_EXPORTS,
    element: (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ExportTokens />
      </React.Suspense>
    ),
    isProtected: true,
    requiredPermission: 'admin:roles:export',
  },
];