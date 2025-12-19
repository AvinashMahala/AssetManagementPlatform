import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, FileImage } from 'lucide-react';
import { useProperties, useDeleteProperty } from '../../../hooks';
import { useNotifications } from '../../../contexts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/componentDesignLibrary';
import { Pagination } from '@/componentDesignLibrary';
import { PropertyStatus, PropertyType } from '../../../types/property';
import { AppLayout } from '../../../components/layout/AppLayout';
import PropertyFilters from './PropertyFilters';
import PropertyBulkActions from './PropertyBulkActions';
import PropertyGridView from './PropertyGridView';
import PropertyTableView from './PropertyTableView';
import './PropertyList.scss';

const PropertyList: React.FC = () => {
  const navigate = useNavigate();
  const [filters] = useState({});
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

  const handleBulkDelete = async () => {
    if (selectedProperties.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedProperties.size} propert${selectedProperties.size !== 1 ? 'ies' : 'y'}? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      // Delete properties one by one
      const deletePromises = Array.from(selectedProperties).map(id => deleteProperty(id));
      await Promise.all(deletePromises);

      showSuccess(`${selectedProperties.size} propert${selectedProperties.size !== 1 ? 'ies' : 'y'} deleted successfully.`);

      // Clear selection and refresh data
      setSelectedProperties(new Set());
      setShowBulkActions(false);
      updateFilters({});
    } catch (error) {
      console.error('Failed to delete properties:', error);
      showError('Failed to delete some properties. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedProperties(new Set());
    setShowBulkActions(false);
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
          <Card className="error-state border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Error Loading Properties</CardTitle>
              <CardDescription>{displayError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="retry-button" onClick={() => updateFilters({})}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="property-list-page-enhanced">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading properties...</p>
            <p className="loading-subtext">Please wait while we fetch your property data</p>
          </div>
        ) : (
          <div className="py-2 space-y-2">
          {/* Header */}
          <div className="property-list-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div>
              <h1 className="header-title text-2xl font-bold text-gray-900 dark:text-white">
                Properties <span className="header-subtitle text-base font-normal text-gray-600 dark:text-gray-400">(Manage your property portfolio)</span>
              </h1>
            </div>
            <div className="header-actions flex gap-2">
              <Button variant="outline" onClick={() => navigate('/templates')}>
                <FileImage className="mr-2 h-4 w-4" />
                Templates
              </Button>
              <Button
                className="action-button bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
                onClick={() => navigate('/properties/create-tabbed')}
                title="Step-by-step guided form with progress tracking"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>

        {/* Stats Cards */}
        <div className="stats-section grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          <Card className="stats-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Properties</CardTitle>
              <Building2 className="stats-icon h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="stats-value text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Across all locations
              </p>
            </CardContent>
          </Card>

          <Card className="stats-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">Available</CardTitle>
              <div className="stats-icon h-3 w-3 rounded-full bg-green-500"></div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="stats-value text-2xl font-bold">{stats.available}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ready for tenants
              </p>
            </CardContent>
          </Card>

          <Card className="stats-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">Occupied</CardTitle>
              <div className="stats-icon h-3 w-3 rounded-full bg-blue-500"></div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="stats-value text-2xl font-bold">{stats.occupied}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Currently rented
              </p>
            </CardContent>
          </Card>

          <Card className="stats-card hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400">Maintenance</CardTitle>
              <div className="stats-icon h-3 w-3 rounded-full bg-orange-500"></div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="stats-value text-2xl font-bold">{stats.maintenance}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Under repair
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <PropertyFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
          typeFilter={typeFilter}
          onTypeFilterChange={(value) => {
            setTypeFilter(value);
            setCurrentPage(1);
          }}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Bulk Actions Toolbar */}
        {showBulkActions && selectedProperties.size > 0 && (
          <PropertyBulkActions
            selectedCount={selectedProperties.size}
            onClearSelection={clearSelection}
            onBulkMaintenance={handleBulkMaintenance}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            bulkActionLoading={bulkActionLoading}
          />
        )}

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && (
          <Card className="empty-state">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Building2 className="empty-icon mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="empty-title text-xl font-semibold mb-2">No properties found</h3>
                <p className="empty-description text-muted-foreground mb-6">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first property'}
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <Button className="empty-action-button" onClick={() => navigate('/properties/create')}>
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
          <PropertyGridView
            properties={paginatedProperties}
            selectedProperties={selectedProperties}
            onSelectProperty={handleSelectProperty}
            onDeleteClick={handleDeleteClick}
          />
        )}

        {/* Table View */}
        {!loading && viewMode === 'table' && filteredProperties.length > 0 && (
          <PropertyTableView
            properties={paginatedProperties}
            selectedProperties={selectedProperties}
            onSelectProperty={handleSelectProperty}
            onSelectAll={handleSelectAll}
            onDeleteClick={handleDeleteClick}
          />
        )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      </div>
      )}

      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="delete-dialog">
          <DialogHeader>
            <DialogTitle className="dialog-title">Delete Property</DialogTitle>
            <DialogDescription className="dialog-description">
              Are you sure you want to delete "{propertyToDelete?.name}"? This action cannot be undone and will also delete all associated units, leases, and payment records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="dialog-actions">
            <Button
              variant="outline"
              className="cancel-button"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="delete-button"
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

export default PropertyList;