import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

const UtilityTypeListPage = lazy(() => import('../../features/utilityTypes/pages/UtilityTypeListPage/UtilityTypeListPage').then(module => ({ default: module.UtilityTypeListPage })));
const UtilityTypeCreatePage = lazy(() => import('../../features/utilityTypes/pages/UtilityTypeCreatePage/UtilityTypeCreatePage').then(module => ({ default: module.UtilityTypeCreatePage })));
const UtilityTypeEditPage = lazy(() => import('../../features/utilityTypes/pages/UtilityTypeEditPage/UtilityTypeEditPage').then(module => ({ default: module.UtilityTypeEditPage })));

export const utilityTypesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.ADMIN_UTILITY_TYPES,
    element: <UtilityTypeListPage />,
    isProtected: true,
    // requiredPermission: 'admin:utilitytypes:view' // Add permission if needed
  },
  {
    path: ROUTE_PATHS.ADMIN_UTILITY_TYPE_CREATE,
    element: <UtilityTypeCreatePage />,
    isProtected: true,
    // requiredPermission: 'admin:utilitytypes:create'
  },
  {
    path: ROUTE_PATHS.ADMIN_UTILITY_TYPE_EDIT,
    element: <UtilityTypeEditPage />,
    isProtected: true,
    // requiredPermission: 'admin:utilitytypes:update'
  },
];
