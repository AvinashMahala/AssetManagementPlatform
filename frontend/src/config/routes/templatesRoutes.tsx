import { lazy } from 'react';
import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';

// Lazy-loaded template components
const TemplateEditor = lazy(() => import('../../features/templates/pages/TemplateEditor'));
const TemplateGallery = lazy(() => import('../../features/templates/pages/TemplateGallery'));

export const templatesRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.TEMPLATES,
    element: <TemplateGallery />,
    isProtected: true,
  },
  {
    path: ROUTE_PATHS.TEMPLATE_EDITOR,
    element: <TemplateEditor />,
    isProtected: true,
  },
];