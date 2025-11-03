import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Building2, MapPin, Grid3x3, List, BarChart3 } from 'lucide-react';
import { useProperties, useDeleteProperty } from '../../hooks';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import type { PropertyFilters } from '../../types/property';
import { PropertyType, PropertyStatus } from '../../types/property';
import { AppLayout } from '../../components/layout/AppLayout';

const PropertyListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [filters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const { properties, loading, error, pagination, updateFilters } = useProperties(filters);
  const { mutate: deleteProperty, loading: deleteLoading } = useDeleteProperty();

  // Filter properties based on search, status, and type
  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = !searchQuery || 
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.state.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesType = typeFilter === 'all' || property.propertyType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [properties, searchQuery, statusFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: properties.length,
      available: properties.filter(p => p.status === PropertyStatus.AVAILABLE).length,
      occupied: properties.filter(p => p.status === PropertyStatus.OCCUPIED).length,
      maintenance: properties.filter(p => p.status === PropertyStatus.UNDER_MAINTENANCE).length,
    };
  }, [properties]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setPropertyToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteProperty(propertyToDelete.id);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      updateFilters({});
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case PropertyStatus.AVAILABLE:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case PropertyStatus.OCCUPIED:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case PropertyStatus.UNDER_MAINTENANCE:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case PropertyStatus.VACANT:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      [PropertyType.APARTMENT]: 'Apartment',
      [PropertyType.HOUSE]: 'House',
      [PropertyType.VILLA]: 'Villa',
      [PropertyType.COMMERCIAL]: 'Commercial',
      [PropertyType.PG_HOSTEL]: 'PG/Hostel',
      [PropertyType.CO_LIVING]: 'Co-Living',
      [PropertyType.OFFICE]: 'Office',
      [PropertyType.SHOP]: 'Shop',
      [PropertyType.WAREHOUSE]: 'Warehouse',
    };
    return labels[type] || type;
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Error Loading Properties</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => updateFilters({})}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground mt-1">
              Manage your property portfolio
            </p>
          </div>
          <Button onClick={() => navigate('/properties/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all locations
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.available}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for tenants
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Occupied</CardTitle>
              <div className="h-4 w-4 rounded-full bg-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.occupied}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently rented
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
              <div className="h-4 w-4 rounded-full bg-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.maintenance}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Under repair
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties by name or location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Status</option>
            <option value={PropertyStatus.AVAILABLE}>Available</option>
            <option value={PropertyStatus.OCCUPIED}>Occupied</option>
            <option value={PropertyStatus.UNDER_MAINTENANCE}>Maintenance</option>
            <option value={PropertyStatus.VACANT}>Vacant</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Types</option>
            <option value={PropertyType.APARTMENT}>Apartment</option>
            <option value={PropertyType.HOUSE}>House</option>
            <option value={PropertyType.VILLA}>Villa</option>
            <option value={PropertyType.COMMERCIAL}>Commercial</option>
            <option value={PropertyType.PG_HOSTEL}>PG/Hostel</option>
            <option value={PropertyType.CO_LIVING}>Co-Living</option>
            <option value={PropertyType.OFFICE}>Office</option>
            <option value={PropertyType.SHOP}>Shop</option>
            <option value={PropertyType.WAREHOUSE}>Warehouse</option>
          </select>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first property'}
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button onClick={() => navigate('/properties/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && filteredProperties.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow group">
                <div className={`h-2 rounded-t-lg ${getStatusColor(property.status).split(' ')[0]}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{property.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{property.address.city}, {property.address.state}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(property.propertyType)}
                    </Badge>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Area</p>
                      <p className="font-semibold">
                        {property.totalArea ? `${property.totalArea.toLocaleString()} sq ft` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Floors</p>
                      <p className="font-semibold">{property.totalFloors || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/properties/${property.id}/dashboard`)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/properties/${property.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(property.id, property.name)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table View */}
        {!loading && viewMode === 'table' && filteredProperties.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Area (sq ft)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => navigate(`/properties/${property.id}/dashboard`)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          >
                            {property.name}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTypeLabel(property.propertyType)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {property.address.city}, {property.address.state}
                          </div>
                        </TableCell>
                        <TableCell>
                          {property.totalArea ? property.totalArea.toLocaleString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(property.status)}>
                            {property.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/properties/${property.id}/dashboard`)}
                              title="View Dashboard"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/properties/${property.id}/edit`)}
                              title="Edit Property"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(property.id, property.name)}
                              title="Delete Property"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} properties
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => updateFilters({ page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilters({ page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone and will also delete all associated units, leases, and payment records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PropertyListPageEnhanced;
