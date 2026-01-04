import { lazy } from 'react';
import type { RouteConfig } from '../routeTypes';

const TariffListPage = lazy(() => import('../../features/tariffs/pages').then(module => ({ default: module.TariffListPage })));
const TariffCreatePage = lazy(() => import('../../features/tariffs/pages').then(module => ({ default: module.TariffCreatePage })));
const TariffEditPage = lazy(() => import('../../features/tariffs/pages').then(module => ({ default: module.TariffEditPage })));

export const tariffsRoutes: RouteConfig[] = [
  {
    path: '/tariffs',
    element: <TariffListPage />,
    roles: ['admin', 'manager'],
  },
  {
    path: '/tariffs/new',
    element: <TariffCreatePage />,
    roles: ['admin', 'manager'],
  },
  {
    path: '/tariffs/:id',
    element: <TariffEditPage />,
    roles: ['admin', 'manager'],
  },
];
