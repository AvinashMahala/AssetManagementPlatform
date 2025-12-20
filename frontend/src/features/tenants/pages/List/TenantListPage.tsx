import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, UserCheck, UserX, Eye, Edit, FileImage, Download, X, XCircle, Mail, Phone, Briefcase, Trash2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/componentDesignLibrary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/componentDesignLibrary';
import { Pagination } from '@/componentDesignLibrary';
import { useTenants, useDeleteTenant } from '@/hooks';
import { useNotifications } from '@/contexts';
import { AppLayout } from '@/components/layout';
import './TenantListPage.module.scss';

const TenantListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { tenants, loading } = useTenants();
  const { mutate: deleteTenant, loading: deleteLoading } = useDeleteTenant();
  const { showSuccess, showError } = useNotifications();

  const filteredTenants = Array.isArray(tenants) ? tenants.filter(t => {
    const matchesSearch = `${t.firstName} ${t.lastName} ${t.email || ''} ${t.phone || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredTenants.length / itemsPerPage);
  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = Array.isArray(tenants) ? tenants.filter(t => t.status === 'active').length : 0;
  const inactiveCount = Array.isArray(tenants) ? tenants.filter(t => t.status === 'inactive').length : 0;

  const stats = [
    { label: 'Total Tenants', value: (Array.isArray(tenants) ? tenants.length : 0).toString(), icon: Users },
    { label: 'Active', value: activeCount.toString(), icon: UserCheck },
    { label: 'Inactive', value: inactiveCount.toString(), icon: UserX },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      default: return 'outline';
    }
  };

  // Bulk selection handlers
  const handleSelectTenant = (tenantId: string, checked: boolean) => {
    const newSelected = new Set(selectedTenants);
    if (checked) {
      newSelected.add(tenantId);
    } else {
      newSelected.delete(tenantId);
    }
    setSelectedTenants(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredTenants.map(t => t.id));
      setSelectedTenants(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedTenants(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedTenants.size === 0) return;

    setBulkActionLoading(true);
    try {
      // TODO: Implement bulk deactivate API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear selection after successful operation
      setSelectedTenants(new Set());
      setShowBulkActions(false);
      showSuccess(`${selectedTenants.size} tenant${selectedTenants.size !== 1 ? 's' : ''} deactivated successfully.`);
    } catch (error) {
      console.error('Failed to deactivate tenants:', error);
      showError('Failed to deactivate tenants. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTenants.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedTenants.size} tenant${selectedTenants.size !== 1 ? 's' : ''}? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      // Delete tenants one by one
      const deletePromises = Array.from(selectedTenants).map(id => deleteTenant(id));
      await Promise.all(deletePromises);

      showSuccess(`${selectedTenants.size} tenant${selectedTenants.size !== 1 ? 's' : ''} deleted successfully.`);

      // Clear selection after successful operation
      setSelectedTenants(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to delete tenants:', error);
      showError('Failed to delete tenants. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = filteredTenants.filter(t => selectedTenants.has(t.id));

    if (selectedData.length === 0) return;

    // Create CSV content
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Occupation', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(tenant => [
        `"${tenant.firstName}"`,
        `"${tenant.lastName}"`,
        `"${tenant.email}"`,
        `"${tenant.phone}"`,
        `"${tenant.occupation || 'N/A'}"`,
        `"${tenant.status}"`
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tenants_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear selection after export
    setSelectedTenants(new Set());
    setShowBulkActions(false);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setTenantToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!tenantToDelete) return;

    try {
      await deleteTenant(tenantToDelete.id);
      showSuccess(`Tenant "${tenantToDelete.name}" has been successfully deleted.`);
      setDeleteDialogOpen(false);
      setTenantToDelete(null);
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      showError('Failed to delete tenant. Please try again.');
    }
  };

  const clearSelection = () => {
    setSelectedTenants(new Set());
    setShowBulkActions(false);
  };

  return (
    <AppLayout title="Tenants">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading tenants...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your tenant data</p>
          </div>
        </div>
      ) : (
        <div className="tenant-list-page-enhanced py-2 space-y-2 scroll-reveal revealed">
        {/* Header Actions */}
        <div className="header-section flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h1 className="header-title text-2xl font-bold text-gray-900 dark:text-white">
              Tenants <span className="header-subtitle text-base font-normal text-gray-600 dark:text-gray-400">(Manage tenant relationships)</span>
            </h1>
          </div>
          <div className="header-actions flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')}>
              <FileImage className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => navigate('/tenants/create-tabbed')}
              title="Step-by-step guided form with progress tracking"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tenant
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div id="stats-section" className="stats-section grid gap-2 md:grid-cols-3 scroll-reveal revealed">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="stat-card hover:shadow-md transition-shadow" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="stat-label text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className="stat-icon-container p-1.5 rounded-lg">
                  <stat.icon className="stat-icon h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="stat-value text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card id="filters-section" className="filters-section scroll-reveal revealed">
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by name, email, phone..." 
                  value={search} 
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }} 
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Items per page */}
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {itemsPerPageOptions.map(option => (
                        <SelectItem key={option.value} value={option.value.toString()}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
          {showBulkActions && selectedTenants.size > 0 && (
            <div className="bulk-actions-toolbar border-t bg-muted/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedTenants.size} tenant{selectedTenants.size !== 1 ? 's' : ''} selected
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
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDeactivate}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Deactivate Selected
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
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {paginatedTenants.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div id="tenants-table" className="table-view scroll-reveal revealed">
            <Card className="border">
              <CardContent className="p-0">
                {/* Fixed Header */}
                <div className="table-header-fixed">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <TableHead className="w-12 py-2 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTenants.size === paginatedTenants.length && paginatedTenants.length > 0}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="header-checkbox rounded border-gray-300"
                          />
                        </TableHead>
                        <TableHead className="w-[25%] min-w-[150px] py-2 px-3">Tenant</TableHead>
                        <TableHead className="w-[25%] min-w-[150px] py-2 px-3">Contact</TableHead>
                        <TableHead className="w-[20%] min-w-[120px] py-2 px-3">Occupation</TableHead>
                        <TableHead className="w-[10%] min-w-[80px] py-2 px-3">Status</TableHead>
                        <TableHead className="w-[15%] min-w-[120px] py-2 px-3 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>

                {/* Scrollable Body */}
                <div className="table-body-scrollable">
                  <Table>
                    <TableBody>
                      {paginatedTenants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-32 text-xs text-muted-foreground">
                            {filteredTenants.length === 0 && tenants.length > 0 ? 'No tenants match your filters.' : 'No tenants found. Click "Add Tenant" to create one.'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTenants.map((tenant) => (
                          <TableRow 
                            key={tenant.id} 
                            className={`hover:bg-orange-50 dark:hover:bg-orange-950/10 transition-colors cursor-pointer ${tenant.status === 'active' ? 'bg-green-50/30 dark:bg-green-950/10' : ''}`}
                            onClick={() => navigate(`/tenants/${tenant.id}`)}
                          >
                            <TableCell className="w-12 py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedTenants.has(tenant.id)}
                                onChange={(e) => handleSelectTenant(tenant.id, e.target.checked)}
                                className="row-checkbox rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell className="w-[25%] min-w-[150px] py-2 px-3">
                              <div className="flex items-center space-x-2">
                                <div className="flex-shrink-0">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                                    {tenant.firstName[0]}{tenant.lastName[0]}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                                  <p className="text-xs text-muted-foreground">ID: {tenant.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-[25%] min-w-[150px] py-2 px-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span className="truncate max-w-[200px]">{tenant.email}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {tenant.phone}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="w-[20%] min-w-[120px] py-2 px-3">
                              <div className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
                                {tenant.occupation || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="w-[10%] min-w-[80px] py-2 px-3">
                              <Badge className={`text-xs px-1.5 py-0 ${tenant.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="w-[15%] min-w-[120px] py-2 px-3 text-right">
                              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tenants/${tenant.id}/dashboard`);
                                  }}
                                  title="View dashboard"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tenants/${tenant.id}`);
                                  }}
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/tenants/${tenant.id}/edit`);
                                  }}
                                  title="Edit tenant"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(tenant.id, `${tenant.firstName} ${tenant.lastName}`);
                                  }}
                                  title="Delete tenant"
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
              </CardContent>
            </Card>
          </div>
            ) : (
              /* Grid View */
              <div id="tenants-grid" className="grid-view grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 scroll-reveal revealed">
                {paginatedTenants.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {filteredTenants.length === 0 && tenants.length > 0 ? 'No tenants match your filters.' : 'No tenants found. Click "Add Tenant" to create one.'}
                  </div>
                ) : (
                  paginatedTenants.map((tenant, index) => (
                    <Card 
                      key={tenant.id} 
                      className="tenant-card cursor-pointer overflow-hidden group"
                      onClick={() => navigate(`/tenants/${tenant.id}`)}
                      style={{ '--tenant-index': index } as React.CSSProperties}
                    >
                      {/* Status Banner */}
                      <div className="status-banner h-2 bg-gradient-to-r from-green-500 to-emerald-600" style={{
                        background: tenant.status === 'active' 
                          ? 'linear-gradient(90deg, #10b981, #059669)' 
                          : tenant.status === 'inactive' 
                          ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                          : 'linear-gradient(90deg, #6b7280, #4b5563)'
                      }} />
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="tenant-avatar h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                              {tenant.firstName[0]}{tenant.lastName[0]}
                            </div>
                            <div>
                              <CardTitle className="tenant-name text-lg">{tenant.firstName} {tenant.lastName}</CardTitle>
                              <p className="tenant-contact text-xs text-muted-foreground">ID: {tenant.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(tenant.status)} className="tenant-status-badge">
                            {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 pb-2">
                        <div className="tenant-details space-y-1.5 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">{tenant.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium">{tenant.phone}</span>
                          </div>
                          {tenant.occupation && (
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium">{tenant.occupation}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <div className="border-t px-4 py-2 bg-muted/30">
                        <div className="tenant-actions flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tenants/${tenant.id}/dashboard`);
                            }}
                            title="View Dashboard"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tenants/${tenant.id}`);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/tenants/${tenant.id}/edit`);
                            }}
                            title="Edit Tenant"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(tenant.id, `${tenant.firstName} ${tenant.lastName}`);
                            }}
                            title="Delete Tenant"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
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
            <DialogTitle>Delete Tenant</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{tenantToDelete?.name}"? This action cannot be undone and will also delete all associated leases and payment records.
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

export default TenantListPageEnhanced;
