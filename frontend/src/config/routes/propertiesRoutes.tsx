import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded property components from features
const PropertyListPageEnhanced = lazy(() => import('../../features/properties/pages/List/PropertyList'));
const PropertyCreatePageTabbed = lazy(() => import('../../features/properties/pages/Create/PropertyCreate'));
const PropertyEditPageEnhanced = lazy(() => import('../../features/properties/pages/Edit/PropertyEdit'));
const PropertyDetailPage = lazy(() => import('../../features/properties/pages/Detail/PropertyDetail'));
const PropertyDashboardPageEnhanced = lazy(() => import('../../features/properties/pages/Dashboard/PropertyDashboard'));
const PropertyTemplateCustomization = lazy(() => import('../../features/templates/pages/PropertyTemplateCustomization'));

export const propertiesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.PROPERTIES,
    element: <PropertyListPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PROPERTIES_CREATE_TABBED,
    element: <PropertyCreatePageTabbed />,
    isProtected: true,
    requiredPermission: 'properties:property:create'
  },
  {
    path: ROUTE_PATHS.PROPERTY_DASHBOARD,
    element: <PropertyDashboardPageEnhanced />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PROPERTY_DETAIL,
    element: <AppLayout><PropertyDetailPage /></AppLayout>,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.PROPERTY_EDIT,
    element: <PropertyEditPageEnhanced />,
    isProtected: true,
    requiredPermission: 'properties:property:update'
  },
  {
    path: ROUTE_PATHS.PROPERTY_TEMPLATE_CUSTOMIZATION,
    element: <PropertyTemplateCustomization />,
    isProtected: true,
  },
];