import { ROUTE_PATHS } from '../../constants/routes';
import type { RouteConfig } from '../routeTypes';
import { AppLayout } from '../../components/layout/AppLayout';

export const adminRoutes: RouteConfig[] = [
  {
    path: ROUTE_PATHS.ADMIN,
    element: (
      <AppLayout title="Admin Panel">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h2>
          <p className="text-gray-600">Admin functionality coming soon...</p>
        </div>
      </AppLayout>
    ),
    isProtected: true,
    requiredRole: 'admin',
  },
];