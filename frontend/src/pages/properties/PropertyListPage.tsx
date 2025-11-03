import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperties, useDeleteProperty } from '../../hooks';
import { Card } from '../../components/common';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { PropertyFilters } from '../../types/property';
import { PropertyType, PropertyStatus } from '../../types/property';

const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { properties, loading, error, pagination, updateFilters } = useProperties(filters);
  const { mutate: deleteProperty, loading: deleteLoading } = useDeleteProperty();

  // Debug logging
  console.log('[PropertyListPage] Render - Properties:', properties);
  console.log('[PropertyListPage] Render - Loading:', loading);
  console.log('[PropertyListPage] Render - Error:', error);
  console.log('[PropertyListPage] Render - Properties length:', properties?.length);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    updateFilters({ search: query, page: 1 });
  };

  const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
    updateFilters({ [key]: value, page: 1 });
  };

  const handleDeleteProperty = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProperty(id);
        // Refetch properties after deletion
        updateFilters({});
      } catch (error) {
        console.error('Failed to delete property:', error);
        alert('Failed to delete property. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case PropertyStatus.OCCUPIED:
        return 'bg-blue-100 text-blue-800';
      case PropertyStatus.UNDER_MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      case PropertyStatus.VACANT:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  if (loading && properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        </div>
        <Card className="p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        </div>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">Error loading properties: {error}</p>
          <Button onClick={() => updateFilters({})}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
        <Button onClick={() => navigate('/properties/create')}>
          Add Property
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.propertyType || ''}
              onChange={(e) => handleFilterChange('propertyType', e.target.value || undefined)}
            >
              <option value="">All Types</option>
              {Object.values(PropertyType).map((type) => (
                <option key={type} value={type}>
                  {getTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            >
              <option value="">All Statuses</option>
              {Object.values(PropertyStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <Input
              type="text"
              placeholder="Filter by city"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
            />
          </div>
        </div>
      </Card>

      {/* Properties List */}
      <Card className="p-6">
        {properties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No properties found.</p>
            <Button onClick={() => navigate('/properties/create')}>
              Create Your First Property
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {property.buildingPhotos && property.buildingPhotos.length > 0 ? (
                      <img
                        src={property.buildingPhotos[0]}
                        alt={property.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-sm">🏠</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{property.name}</h3>
                    <p className="text-sm text-gray-600">
                      {property.address.street}, {property.address.city}, {property.address.state} {property.address.pincode}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {getTypeLabel(property.propertyType)} • {property.totalArea || 'N/A'} sq ft
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(property.status)}`}>
                    {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/properties/${property.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => navigate(`/properties/${property.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      loading={deleteLoading}
                      onClick={() => handleDeleteProperty(property.id, property.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} properties
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="small"
                disabled={pagination.page <= 1}
                onClick={() => updateFilters({ page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="small"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilters({ page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PropertyListPage;