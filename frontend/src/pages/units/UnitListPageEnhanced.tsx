import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Home, DoorOpen, DoorClosed, Square, Eye, Building2, FileImage, Download, X, Wrench, Trash2, Edit, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import './UnitListPageEnhanced.scss';

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

  // State for scroll-triggered animations
  const [revealedSections, setRevealedSections] = useState<Set<string>>(new Set());

  // Scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setRevealedSections(prev => new Set([...prev, entry.target.id]));
        }
      });
    }, observerOptions);

    // Observe sections that should animate in on scroll
    const sections = ['stats-section', 'filters-section', 'units-grid', 'units-table'];
    sections.forEach(sectionId => {
      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

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
      {loading ? (
        <div className="unit-list-page-enhanced loading-container flex items-center justify-center min-h-[60vh]">
          <div className="loading-spinner animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Loading units...</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch your unit data</p>
        </div>
      ) : (
        <div className="unit-list-page-enhanced py-2 space-y-3 scroll-reveal revealed">
        {/* Header Actions */}
        <div className="unit-list-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h1 className="header-title text-2xl font-bold text-gray-900 dark:text-white">
              Units <span className="header-subtitle text-base font-normal text-gray-600 dark:text-gray-400">(Manage rental units)</span>
            </h1>
          </div>
          <div className="header-actions flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')}>
              <FileImage className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button
              className="action-button bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => navigate('/units/create-tabbed')}
              title="Step-by-step guided form with progress tracking"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Unit
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="stat-card hover:shadow-md transition-shadow" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="stat-label text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className="stat-icon-container p-1.5 rounded-lg">
                  <stat.icon className="stat-icon h-3 w-3 text-white" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="stats-value text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="filters-section flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="search-icon absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              className="search-input pl-9 h-9 text-sm"
              placeholder="Search by unit number, type..." 
              value={search} 
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }} 
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="filter-select h-9 w-[140px] text-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="filter-dropdown">
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={propertyFilter}
            onValueChange={(value) => {
              setPropertyFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="filter-select h-9 w-[160px] text-sm">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent className="filter-dropdown">
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map(property => (
                <SelectItem key={property.id} value={property.id}>{property.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="filter-select h-9 w-[120px] text-sm">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent className="filter-dropdown">
              {itemsPerPageOptions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="view-toggle flex gap-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              className="toggle-button h-9 w-9 p-0"
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <Home className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className="toggle-button h-9 w-9 p-0"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {showBulkActions && selectedUnits.size > 0 && (
          <div className="bulk-actions-toolbar border bg-muted/50 px-4 py-3 rounded-md">
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

        {/* Results Summary */}
        {!loading && filteredUnits.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedUnits.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredUnits.length)} of {filteredUnits.length} units
            </div>
          </div>
        )}

        {/* Table View */}
        {!loading && viewMode === 'table' && filteredUnits.length > 0 && (
          <div className="unit-table-container">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="table-header">
                      <TableHead className="w-12 py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selectedUnits.size === paginatedUnits.length && paginatedUnits.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="header-checkbox rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead className="w-[15%] min-w-[120px] py-2 px-3">Unit Number</TableHead>
                      <TableHead className="w-[15%] min-w-[120px] py-2 px-3">Type</TableHead>
                      <TableHead className="w-[20%] min-w-[150px] py-2 px-3">Property</TableHead>
                      <TableHead className="w-[15%] min-w-[120px] py-2 px-3">Monthly Rent</TableHead>
                      <TableHead className="w-[10%] min-w-[80px] py-2 px-3">Area</TableHead>
                      <TableHead className="w-[10%] min-w-[100px] py-2 px-3">Status</TableHead>
                      <TableHead className="w-[15%] min-w-[140px] py-2 px-3 text-right">Actions</TableHead>
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
                          className={`table-row cursor-pointer ${
                            unit.status === 'available' 
                              ? 'bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30' 
                              : ''
                          }`}
                          onClick={() => navigate(`/units/${unit.id}`)}
                        >
                          <TableCell className="py-2 px-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedUnits.has(unit.id)}
                              onChange={(e) => handleSelectUnit(unit.id, e.target.checked)}
                              className="row-checkbox rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell className="font-medium break-words py-2 px-3 text-sm">{unit.unitNumber}</TableCell>
                          <TableCell className="break-words py-2 px-3 text-sm">{unit.unitType}</TableCell>
                          <TableCell className="break-words py-2 px-3">
                            <div className="flex items-start gap-1">
                              <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <span className="break-words text-sm">{getPropertyName(unit.propertyId)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="break-words py-2 px-3 text-sm">₹{unit.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                          <TableCell className="break-words py-2 px-3 text-sm">{unit.area || 'N/A'}</TableCell>
                          <TableCell className="break-words py-2 px-3">
                            <Badge variant={getStatusVariant(unit.status)} className="text-xs whitespace-normal">
                              {unit.status.replace('_', ' ').charAt(0).toUpperCase() + unit.status.replace('_', ' ').slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-2 px-3">
                            <div className="table-actions flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="table-action-button h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/units/${unit.id}`);
                                }}
                                title="View Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="table-action-button h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/units/${unit.id}/dashboard`);
                                }}
                                title="Dashboard"
                              >
                                <BarChart3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="table-action-button h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/units/${unit.id}/edit`);
                                }}
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="table-action-button h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(unit.id, unit.unitNumber);
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grid View */}
        {!loading && viewMode === 'grid' && filteredUnits.length > 0 && (
          <div className="unit-grid grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {paginatedUnits.map((unit, index) => (
              <Card 
                key={unit.id} 
                className={`unit-card hover:shadow-lg transition-all duration-300 relative flex flex-col cursor-pointer ${
                  unit.status === 'available' ? 'bg-green-50 dark:bg-green-950/20' : ''
                }`}
                onClick={() => navigate(`/units/${unit.id}`)}
                style={{ '--unit-index': index } as React.CSSProperties}
              >
                {/* Status Bar */}
                <div className="unit-status-bar h-1" style={{
                  background: unit.status === 'available' 
                    ? 'linear-gradient(90deg, #10b981, #059669)' 
                    : unit.status === 'occupied' 
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                    : 'linear-gradient(90deg, #6b7280, #4b5563)'
                }} />
                
                {/* Checkbox - Top Right */}
                <div className="absolute top-3 right-3 z-10" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="unit-checkbox rounded border-gray-300 w-4 h-4 cursor-pointer"
                    checked={selectedUnits.has(unit.id)}
                    onChange={(e) => handleSelectUnit(unit.id, e.target.checked)}
                  />
                </div>

                <div className="unit-content px-3 py-2.5 space-y-2 pr-10 flex-1 flex flex-col">
                  {/* Row 1: Unit Number & Type */}
                  <div>
                    <h3 className="unit-title text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">{unit.unitNumber}</h3>
                    <div className="unit-type text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">{unit.unitType}</div>
                  </div>

                  {/* Row 2: Property & Status */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">{getPropertyName(unit.propertyId)}</span>
                    </div>
                    <Badge className={`text-xs px-2 py-0.5 flex-shrink-0 ${getStatusColor(unit.status)}`}>
                      {unit.status === 'available' ? 'Avail' : unit.status === 'occupied' ? 'Occup' : 'Maint'}
                    </Badge>
                  </div>

                  {/* Row 3: Rent & Area */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">₹{unit.monthlyRent?.toLocaleString() || 'N/A'}</span>/mo
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{unit.area || 'N/A'}</span> sf
                    </span>
                  </div>

                  {/* Row 4: Bedrooms (Conditional) */}
                  {unit.bedrooms && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-900 dark:text-white">{unit.bedrooms}</span> BHK
                    </div>
                  )}

                  {/* Row 5: Action Buttons */}
                  <div className="unit-actions flex items-center gap-1 pt-1 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="action-button h-7 px-2 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/units/${unit.id}`);
                      }}
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="action-button h-7 px-2 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/units/${unit.id}/dashboard`);
                      }}
                      title="Dashboard"
                    >
                      <BarChart3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="action-button h-7 px-2 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/units/${unit.id}/edit`);
                      }}
                      title="Edit"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="action-button h-7 px-2 text-red-600 flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(unit.id, unit.unitNumber);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-section flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="dialog-content">
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
