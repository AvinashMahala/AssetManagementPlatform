import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts';
import { useAssets } from '../hooks';
import { Card } from '../components/common';
import { Button } from '../components/common/Button';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();
  const { assets, loading: assetsLoading, error: assetsError } = useAssets();

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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Assets</h3>
          {assetsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ) : assetsError ? (
            <p className="text-red-600">Error loading assets</p>
          ) : (
            <p className="text-3xl font-bold text-blue-600">{Array.isArray(assets) ? assets.length : 0}</p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Assets</h3>
          {assetsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ) : assetsError ? (
            <p className="text-red-600">Error loading assets</p>
          ) : (
            <p className="text-3xl font-bold text-green-600">
              {Array.isArray(assets) ? assets.length : 0}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Value</h3>
          {assetsLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
          ) : assetsError ? (
            <p className="text-red-600">Error loading assets</p>
          ) : (
            <p className="text-3xl font-bold text-blue-600">
              ${Array.isArray(assets) ? assets.reduce((sum, asset) => sum + asset.value, 0).toLocaleString() : '0'}
            </p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assets</h3>
        {assetsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : assetsError ? (
          <p className="text-red-600">Error loading assets</p>
        ) : assets && Array.isArray(assets) && assets.length > 0 ? (
          <div className="space-y-3">
            {assets.slice(0, 5).map(asset => (
              <div key={asset.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{asset.name}</p>
                  <p className="text-sm text-gray-600">
                    {asset.location || 'No location'} • ${asset.value.toLocaleString()}
                  </p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  Active
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No assets found. Create your first asset to get started.</p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;