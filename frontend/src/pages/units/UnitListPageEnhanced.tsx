import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Home, DoorOpen, DoorClosed, Square, Eye, Building2, FileImage, Download, X, Wrench, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Pagination } from '../../components/ui/pagination';
import { useUnits, useDeleteUnit } from '../../hooks/useUnits';
import { useProperties } from '../../hooks/useProperties';
import { AppLayout } from '../../components/layout';

const UnitListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { units, loading } = useUnits();
  const { mutate: deleteUnit, loading: deleteLoading } = useDeleteUnit();
  const { properties } = useProperties();

  const filteredUnits = Array.isArray(units) ? units.filter(u => {
    const matchesSearch = `${u.unitNumber} ${u.unitType}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || u.propertyId === propertyFilter;
    return matchesSearch && matchesStatus && matchesProperty;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const paginatedUnits = filteredUnits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const availableCount = Array.isArray(units) ? units.filter(u => u.status === 'available').length : 0;
  const occupiedCount = Array.isArray(units) ? units.filter(u => u.status === 'occupied').length : 0;
  const maintenanceCount = Array.isArray(units) ? units.filter(u => u.status === 'under_maintenance').length : 0;

  const stats = [
    { label: 'Total Units', value: (Array.isArray(units) ? units.length : 0).toString(), icon: Home, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Available', value: availableCount.toString(), icon: DoorOpen, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Occupied', value: occupiedCount.toString(), icon: DoorClosed, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Maintenance', value: maintenanceCount.toString(), icon: Square, color: 'text-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-900/20' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'under_maintenance', label: 'Under Maintenance' },
  ];

  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'available': return 'default';
      case 'occupied': return 'secondary';
      case 'under_maintenance': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'occupied': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'under_maintenance': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  // Bulk selection handlers
  const handleSelectUnit = (unitId: string, checked: boolean) => {
    const newSelected = new Set(selectedUnits);
    if (checked) {
      newSelected.add(unitId);
    } else {
      newSelected.delete(unitId);
    }
    setSelectedUnits(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredUnits.map(u => u.id));
      setSelectedUnits(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedUnits(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkMaintenance = async () => {
    if (selectedUnits.size === 0) return;

    setBulkActionLoading(true);
    try {
      // TODO: Implement bulk maintenance API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Marking units as under maintenance:', Array.from(selectedUnits));

      // Clear selection after successful operation
      setSelectedUnits(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to mark units as maintenance:', error);
      // TODO: Show error toast
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUnits.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedUnits.size} unit${selectedUnits.size !== 1 ? 's' : ''}? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      // Delete units one by one
      const deletePromises = Array.from(selectedUnits).map(id => deleteUnit(id));
      await Promise.all(deletePromises);

      console.log('Deleted units:', Array.from(selectedUnits));

      // Clear selection after successful operation
      setSelectedUnits(new Set());
      setShowBulkActions(false);
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to delete units:', error);
      // TODO: Show error toast
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = filteredUnits.filter(u => selectedUnits.has(u.id));

    if (selectedData.length === 0) return;

    // Create CSV content
    const headers = ['Unit Number', 'Unit Type', 'Property', 'Monthly Rent', 'Area', 'Bedrooms', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(unit => [
        `"${unit.unitNumber}"`,
        `"${unit.unitType}"`,
        `"${getPropertyName(unit.propertyId)}"`,
        unit.monthlyRent || '',
        unit.area || '',
        unit.bedrooms || '',
        `"${unit.status}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `units_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear selection after export
    setSelectedUnits(new Set());
    setShowBulkActions(false);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setUnitToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;

    try {
      await deleteUnit(unitToDelete.id);
      setDeleteDialogOpen(false);
      setUnitToDelete(null);
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to delete unit:', error);
      // TODO: Show error toast
    }
  };

  const clearSelection = () => {
    setSelectedUnits(new Set());
    setShowBulkActions(false);
  };

  return (
    <AppLayout title="Units">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
                        <h1 className="text-3xl font-bold tracking-tight">Manage Property Units</h1>
            <p className="text-muted-foreground">Organize and track individual rental units</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')} size="lg">
              <FileImage className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button
              onClick={() => navigate('/units/create-tabbed')}
              size="lg"
              title="Step through a comprehensive unit creation process"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Unit
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by unit number, type..." 
                  value={search} 
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }} 
                  className="pl-9"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <select
                  value={propertyFilter}
                  onChange={(e) => {
                    setPropertyFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Properties</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>

                {/* Items per page */}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {itemsPerPageOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                {/* View Toggle */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-r-none"
                  >
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    Grid
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          {/* Bulk Actions Toolbar */}
          {showBulkActions && selectedUnits.size > 0 && (
            <div className="border-t bg-muted/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedUnits.size} unit{selectedUnits.size !== 1 ? 's' : ''} selected
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
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Selected
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

          <CardContent>
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedUnits.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUnits.length)} of {filteredUnits.length} units
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : viewMode === 'table' ? (
              /* Table View */
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedUnits.size === paginatedUnits.length && paginatedUnits.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Unit Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Monthly Rent</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUnits.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          {filteredUnits.length === 0 && units.length > 0 ? 'No units match your filters.' : 'No units found. Click "Add Unit" to create one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUnits.map((unit) => (
                        <TableRow 
                          key={unit.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/units/${unit.id}`)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedUnits.has(unit.id)}
                              onChange={(e) => handleSelectUnit(unit.id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{unit.unitNumber}</TableCell>
                          <TableCell>{unit.unitType}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                              {getPropertyName(unit.propertyId)}
                            </div>
                          </TableCell>
                          <TableCell>₹{unit.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell>{unit.area || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(unit.status)}>
                              {unit.status.replace('_', ' ').charAt(0).toUpperCase() + unit.status.replace('_', ' ').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/units/${unit.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/units/${unit.id}/dashboard`);
                                }}
                              >
                                📊
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(unit.id, unit.unitNumber);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedUnits.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {filteredUnits.length === 0 && units.length > 0 ? 'No units match your filters.' : 'No units found. Click "Add Unit" to create one.'}
                  </div>
                ) : (
                  paginatedUnits.map((unit) => (
                    <Card 
                      key={unit.id} 
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group"
                      onClick={() => navigate(`/units/${unit.id}`)}
                    >
                      {/* Status Banner */}
                      <div className={`h-2 ${
                        unit.status === 'available' ? 'bg-green-500' :
                        unit.status === 'occupied' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`} />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                              unit.status === 'available' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                              unit.status === 'occupied' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                              'bg-gradient-to-br from-gray-500 to-slate-600'
                            }`}>
                              {unit.unitNumber}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{unit.unitType}</CardTitle>
                              <p className="text-xs text-muted-foreground">ID: {unit.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(unit.status)} className={getStatusColor(unit.status)}>
                            {unit.status === 'available' ? 'Available' : unit.status === 'occupied' ? 'Occupied' : 'Maintenance'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Property</span>
                            <span className="font-medium flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {getPropertyName(unit.propertyId).slice(0, 15)}...
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Rent</span>
                            <span className="font-bold text-primary">₹{unit.monthlyRent?.toLocaleString() || 'N/A'}/mo</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Area</span>
                            <span className="font-medium">{unit.area || 'N/A'} sq ft</span>
                          </div>
                          {unit.bedrooms && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Bedrooms</span>
                              <span className="font-medium">{unit.bedrooms} BHK</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/units/${unit.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/units/${unit.id}/dashboard`);
                            }}
                          >
                            📊 Dashboard
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete unit "{unitToDelete?.name}"? This action cannot be undone and will also delete all associated leases and payment records.
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

export default UnitListPageEnhanced;
