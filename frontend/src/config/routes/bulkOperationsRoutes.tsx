import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded bulk operations components
const BulkOperationsDashboard = lazy(() => import('../../features/bulkOperations').then(module => ({ default: module.BulkOperationsDashboard })));

export const bulkOperationsRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.BULK_OPERATIONS,
    element: <BulkOperationsDashboard />,
    isProtected: true,
    requiredPermission: 'bulk:operations:execute'
  },
];