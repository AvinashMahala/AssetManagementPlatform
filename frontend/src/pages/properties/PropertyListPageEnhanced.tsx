import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Building2, MapPin, Grid3x3, List, BarChart3, FileImage, Download, X, Wrench, Receipt } from 'lucide-react';
import { useProperties, useDeleteProperty } from '../../hooks';
import { useNotifications } from '../../contexts';
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
import { Pagination } from '../../components/ui/pagination';
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
  const [selectedProperties, setSelectedProperties] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  const { properties, loading, error, displayError, updateFilters } = useProperties(filters);
  const { mutate: deleteProperty, loading: deleteLoading } = useDeleteProperty();
  const { showSuccess, showError } = useNotifications();

  // Filter properties based on search, status, and type
  const filteredProperties = useMemo(() => {
    return Array.isArray(properties) ? properties.filter(property => {
      const matchesSearch = !searchQuery || 
        property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address.state.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesType = typeFilter === 'all' || property.propertyType === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    }) : [];
  }, [properties, searchQuery, statusFilter, typeFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const paginatedProperties = filteredProperties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: Array.isArray(properties) ? properties.length : 0,
      available: Array.isArray(properties) ? properties.filter(p => p.status === PropertyStatus.AVAILABLE).length : 0,
      occupied: Array.isArray(properties) ? properties.filter(p => p.status === PropertyStatus.OCCUPIED).length : 0,
      maintenance: Array.isArray(properties) ? properties.filter(p => p.status === PropertyStatus.UNDER_MAINTENANCE).length : 0,
    };
  }, [properties]);

  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setPropertyToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

    const confirmDelete = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteProperty(propertyToDelete.id);
      showSuccess(`Property "${propertyToDelete.name}" has been successfully deleted.`);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      updateFilters({});
    } catch (error) {
      console.error('Failed to delete property:', error);
      showError('Failed to delete property. Please try again.');
    }
  };

  // Bulk selection handlers
  const handleSelectProperty = (propertyId: string, checked: boolean) => {
    const newSelected = new Set(selectedProperties);
    if (checked) {
      newSelected.add(propertyId);
    } else {
      newSelected.delete(propertyId);
    }
    setSelectedProperties(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedProperties.map(p => p.id));
      setSelectedProperties(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedProperties(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkMaintenance = async () => {
    if (selectedProperties.size === 0) return;

    setBulkActionLoading(true);
    try {
      // TODO: Implement bulk maintenance API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Marking properties as under maintenance:', Array.from(selectedProperties));

      // Clear selection after successful operation
      setSelectedProperties(new Set());
      setShowBulkActions(false);
      showSuccess(`${selectedProperties.size} propert${selectedProperties.size !== 1 ? 'ies' : 'y'} marked as under maintenance.`);
    } catch (error) {
      console.error('Failed to mark properties as maintenance:', error);
      showError('Failed to mark properties as maintenance. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = paginatedProperties.filter(p => selectedProperties.has(p.id));

    if (selectedData.length === 0) return;

    // Create CSV content
    const headers = ['Name', 'Type', 'City', 'State', 'Total Area', 'Floors', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(property => [
        `"${property.name}"`,
        `"${getTypeLabel(property.propertyType)}"`,
        `"${property.address.city}"`,
        `"${property.address.state}"`,
        property.totalArea || '',
        property.totalFloors || '',
        `"${property.status}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `properties_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear selection after export
    setSelectedProperties(new Set());
    setShowBulkActions(false);
  };

  const clearSelection = () => {
    setSelectedProperties(new Set());
    setShowBulkActions(false);
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
              <CardDescription>{displayError}</CardDescription>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')}>
              <FileImage className="mr-2 h-4 w-4" />
              Templates
            </Button>
            <Button onClick={() => navigate('/properties/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
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
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
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
          {/* Items per page */}
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
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

        {/* Bulk Actions Toolbar */}
        {showBulkActions && selectedProperties.size > 0 && (
          <div className="border bg-muted/50 px-4 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">
                  {selectedProperties.size} propert{selectedProperties.size !== 1 ? 'ies' : 'y'} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkMaintenance}
                  disabled={bulkActionLoading}
                >
                  {bulkActionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  ) : (
                    <Wrench className="h-4 w-4 mr-2" />
                  )}
                  Mark as Maintenance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkExport}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </div>
          </div>
        )}

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

        {/* Results Summary */}
        {!loading && filteredProperties.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedProperties.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredProperties.length)} of {filteredProperties.length} properties
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && filteredProperties.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProperties.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow group">
                <div className={`h-2 rounded-t-lg ${getStatusColor(property.status).split(' ')[0]}`} />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedProperties.has(property.id)}
                        onChange={(e) => handleSelectProperty(property.id, e.target.checked)}
                        className="rounded border-gray-300"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
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
                      onClick={() => navigate(`/properties/${property.id}/rent-collection`)}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Rent
                    </Button>
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
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedProperties.size === paginatedProperties.length && paginatedProperties.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Property Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Area (sq ft)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedProperties.has(property.id)}
                            onChange={(e) => handleSelectProperty(property.id, e.target.checked)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
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
                              onClick={() => navigate(`/properties/${property.id}/rent-collection`)}
                              title="Rent Collection"
                            >
                              <Receipt className="h-4 w-4" />
                            </Button>
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

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
