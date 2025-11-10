import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building, MapPin, Home } from 'lucide-react';
import { useProperties, useDeleteProperty } from '../../hooks';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { AppLayout } from '../../components/layout/AppLayout';
import type { PropertyFilters } from '../../types/property';
import { PropertyType, PropertyStatus } from '../../types/property';

const PropertyListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { properties, loading, error, updateFilters } = useProperties(filters);
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

  const stats = [
    { label: 'Total Properties', value: properties.length.toString(), icon: Building, color: 'text-blue-600' },
    { label: 'Available', value: properties.filter(p => p.status === PropertyStatus.AVAILABLE).length.toString(), icon: Home, color: 'text-green-600' },
    { label: 'Occupied', value: properties.filter(p => p.status === PropertyStatus.OCCUPIED).length.toString(), icon: Building, color: 'text-orange-600' },
    { label: 'Under Maintenance', value: properties.filter(p => p.status === PropertyStatus.UNDER_MAINTENANCE).length.toString(), icon: Home, color: 'text-red-600' },
  ];

  const getTypeLabel = (type: string) => {
    return type.replace('_', ' ').toUpperCase();
  };

  if (loading && properties.length === 0) {
    return (
      <AppLayout>
        <div className="h-screen flex flex-col">
          <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your property portfolio</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="h-screen flex flex-col">
          <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
                <p className="text-sm text-gray-600 mt-1">Manage your property portfolio</p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <p className="text-red-600 mb-4">Error loading properties: {error}</p>
              <Button onClick={() => updateFilters({})}>Try Again</Button>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col">
        {/* Header - Fixed height */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your property portfolio
              </p>
            </div>
            <Button onClick={() => navigate('/properties/create')} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Property
            </Button>
          </div>
        </div>

        {/* Stats Cards - Fixed height */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50">
          <div className="grid gap-3 md:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters - Fixed height */}
        <div className="flex-shrink-0 px-6 py-3 bg-white border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-9"
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
                placeholder="Filter by city"
                value={filters.city || ''}
                onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Properties List - Scrollable */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <Card className="h-full flex flex-col shadow-sm">
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-full overflow-auto">
                {properties.length === 0 ? (
                  <div className="text-center py-12 h-64 flex items-center justify-center">
                    <div>
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                      <p className="text-gray-500 mb-4">
                        Get started by creating your first property.
                      </p>
                      <Button onClick={() => navigate('/properties/create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Property
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {property.buildingPhotos && property.buildingPhotos.length > 0 ? (
                              <img
                                src={property.buildingPhotos[0]}
                                alt={property.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Building className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 truncate">{property.name}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                {property.address.street}, {property.address.city}, {property.address.state} {property.address.pincode}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{getTypeLabel(property.propertyType)}</span>
                              <span>•</span>
                              <span>{property.totalArea || 'N/A'} sq ft</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          <Badge
                            variant={
                              property.status === PropertyStatus.AVAILABLE ? 'default' :
                              property.status === PropertyStatus.OCCUPIED ? 'secondary' :
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {property.status?.replace('_', ' ') || 'Unknown'}
                          </Badge>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/properties/${property.id}`)}
                              className="h-8 px-3 text-xs"
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/properties/${property.id}/edit`)}
                              className="h-8 px-3 text-xs"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProperty(property.id, property.name)}
                              disabled={deleteLoading}
                              className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default PropertyListPage;