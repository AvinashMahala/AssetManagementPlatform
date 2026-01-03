import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/componentDesignLibrary';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/constants/routes';

export const AdminHub: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout title="Admin Panel">
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-gray-600">Central place to manage roles, permissions, users, and navigation.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          <Card onClick={() => navigate(ROUTE_PATHS.ADMIN_ROLES)} className="cursor-pointer hover:shadow-lg">
            <h3 className="text-lg font-medium">Roles</h3>
            <p className="text-sm text-gray-500 mt-1">Create and manage roles and assign permissions.</p>
          </Card>

          <Card onClick={() => navigate(ROUTE_PATHS.ADMIN_PERMISSIONS)} className="cursor-pointer hover:shadow-lg">
            <h3 className="text-lg font-medium">Permissions</h3>
            <p className="text-sm text-gray-500 mt-1">View the permission catalog and descriptions.</p>
          </Card>

          <Card onClick={() => navigate(ROUTE_PATHS.ADMIN_USERS)} className="cursor-pointer hover:shadow-lg">
            <h3 className="text-lg font-medium">Users</h3>
            <p className="text-sm text-gray-500 mt-1">Search users and assign roles.</p>
          </Card>

          <Card onClick={() => navigate(ROUTE_PATHS.NAVIGATION_CONFIG)} className="cursor-pointer hover:shadow-lg">
            <h3 className="text-lg font-medium">Navigation</h3>
            <p className="text-sm text-gray-500 mt-1">Configure sidebar navigation and visibility.</p>
          </Card>

          <Card onClick={() => navigate(ROUTE_PATHS.ADMIN_AUDIT)} className="cursor-pointer hover:shadow-lg">
            <h3 className="text-lg font-medium">Audit</h3>
            <p className="text-sm text-gray-500 mt-1">View admin activity logs (coming soon).</p>
          </Card>

          <Card onClick={() => navigate(ROUTE_PATHS.ADMIN_EXPORTS)} className="cursor-pointer hover:shadow-lg">
            <h3 className="text-lg font-medium">Exports</h3>
            <p className="text-sm text-gray-500 mt-1">Manage server export tokens and downloads.</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminHub;