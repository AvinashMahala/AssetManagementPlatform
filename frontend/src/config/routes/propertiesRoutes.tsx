import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

// Lazy-loaded property components
const PropertyListPageEnhanced = lazy(() => import('../../pages/properties/PropertyListPageEnhanced'));
const PropertyCreatePageTabbed = lazy(() => import('../../pages/properties/PropertyCreatePageTabbed'));
const PropertyEditPageEnhanced = lazy(() => import('../../pages/properties/PropertyEditPageEnhanced'));
const PropertyDetailPage = lazy(() => import('../../pages/properties/PropertyDetailPage'));
const PropertyDashboardPageEnhanced = lazy(() => import('../../pages/properties/PropertyDashboardPageEnhanced').then(module => ({ default: module.PropertyDashboardPageEnhanced })));
const PropertyTemplateCustomization = lazy(() => import('../../pages/PropertyTemplateCustomization'));

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
  },
  {
    path: ROUTE_PATHS.PROPERTY_TEMPLATE_CUSTOMIZATION,
    element: <PropertyTemplateCustomization />,
    isProtected: true,
  },
];