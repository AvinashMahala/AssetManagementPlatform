import { lazy } from 'react';
import type { RouteConfig } from '../routeTypes';

const MeterAllocationListPage = lazy(() => import('../../features/meterAllocations/pages').then(module => ({ default: module.MeterAllocationListPage })));
const MeterAllocationCreatePage = lazy(() => import('../../features/meterAllocations/pages').then(module => ({ default: module.MeterAllocationCreatePage })));
const MeterAllocationEditPage = lazy(() => import('../../features/meterAllocations/pages').then(module => ({ default: module.MeterAllocationEditPage })));

export const meterAllocationsRoutes: RouteConfig[] = [
  {
    path: '/meter-allocations',
    element: <MeterAllocationListPage />,
    roles: ['admin', 'manager'],
  },
  {
    path: '/meter-allocations/new',
    element: <MeterAllocationCreatePage />,
    roles: ['admin', 'manager'],
  },
  {
    path: '/meter-allocations/:id',
    element: <MeterAllocationEditPage />,
    roles: ['admin', 'manager'],
  },
];
