import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts';
import { useProperties } from '../hooks';
import { Card } from '../components/common';
import { Button } from '../components/common/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Asset Management</h2>
          <p className="text-gray-600">Please log in to access your dashboard.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {user?.name || user?.username || user?.email}
          </span>
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate('/profile')}
          >
            Profile
          </Button>
          <Button
            variant="danger"
            size="small"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Properties</h3>
          {propertiesLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ) : propertiesError ? (
            <p className="text-red-600">Error loading properties</p>
          ) : (
            <p className="text-3xl font-bold text-blue-600">{Array.isArray(properties) ? properties.length : 0}</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Properties</h3>
          {propertiesLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ) : propertiesError ? (
            <p className="text-red-600">Error loading properties</p>
          ) : (
            <p className="text-3xl font-bold text-green-600">
              {Array.isArray(properties) ? properties.filter(p => p.status === 'available').length : 0}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Area</h3>
          {propertiesLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ) : propertiesError ? (
            <p className="text-red-600">Error loading properties</p>
          ) : (
            <p className="text-3xl font-bold text-blue-600">
              {Array.isArray(properties) ? properties.reduce((sum: number, property) => sum + property.totalArea, 0).toLocaleString() : '0'} sq ft
            </p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Properties</h3>
          <Button variant="secondary" size="small" onClick={() => navigate('/properties')}>
            View All
          </Button>
        </div>
        {propertiesLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : propertiesError ? (
          <p className="text-red-600">Error loading properties</p>
        ) : properties && Array.isArray(properties) && properties.length > 0 ? (
          <div className="space-y-3">
            {properties.slice(0, 5).map(property => (
              <div key={property.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{property.name}</p>
                  <p className="text-sm text-gray-600">
                    {property.address.city}, {property.address.state} • {property.totalArea} sq ft
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  property.status === 'available' ? 'bg-green-100 text-green-800' :
                  property.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                  property.status === 'under_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No properties found. Create your first property to get started.</p>
            <Button onClick={() => navigate('/properties')}>
              Manage Properties
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;