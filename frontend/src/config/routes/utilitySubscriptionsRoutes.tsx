import { lazy } from 'react';
import type { RouteConfig } from '../routeTypes';

const UtilitySubscriptionListPage = lazy(() => import('../../features/utilitySubscriptions/pages').then(module => ({ default: module.UtilitySubscriptionListPage })));
const UtilitySubscriptionCreatePage = lazy(() => import('../../features/utilitySubscriptions/pages').then(module => ({ default: module.UtilitySubscriptionCreatePage })));
const UtilitySubscriptionEditPage = lazy(() => import('../../features/utilitySubscriptions/pages').then(module => ({ default: module.UtilitySubscriptionEditPage })));

export const utilitySubscriptionsRoutes: RouteConfig[] = [
  {
    path: '/utility-subscriptions',
    element: <UtilitySubscriptionListPage />,
    roles: ['admin', 'manager'],
  },
  {
    path: '/utility-subscriptions/new',
    element: <UtilitySubscriptionCreatePage />,
    roles: ['admin', 'manager'],
  },
  {
    path: '/utility-subscriptions/:id',
    element: <UtilitySubscriptionEditPage />,
    roles: ['admin', 'manager'],
  },
];
