import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded rent collection components
const PropertyRentCollectionPage = lazy(() => import('../../pages/rentCollection/PropertyRentCollectionPage').then(module => ({ default: module.PropertyRentCollectionPage })));
const UnitRentCollectionPage = lazy(() => import('../../pages/rentCollection/UnitRentCollectionPage').then(module => ({ default: module.UnitRentCollectionPage })));
const MonthlySummaryDashboard = lazy(() => import('../../pages/rentCollection/MonthlySummaryDashboard').then(module => ({ default: module.MonthlySummaryDashboard })));
const RentCollectionWorkflowDashboard = lazy(() => import('../../pages/rentCollection/RentCollectionWorkflowDashboard').then(module => ({ default: module.RentCollectionWorkflowDashboard })));

export const rentCollectionRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.PROPERTY_RENT_COLLECTION,
    element: <PropertyRentCollectionPage />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PROPERTY_RENT_COLLECTION_MONTHLY_SUMMARY,
    element: <MonthlySummaryDashboard />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.RENT_COLLECTION_WORKFLOW_DASHBOARD,
    element: <RentCollectionWorkflowDashboard />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.UNIT_COLLECT_RENT,
    element: <UnitRentCollectionPage />,
    isProtected: true,
  },
];