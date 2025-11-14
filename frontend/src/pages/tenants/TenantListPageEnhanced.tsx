import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, UserCheck, UserX, Eye, Edit, FileImage, Download, X, XCircle, Mail, Phone, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination } from '../../components/ui/pagination';
import { useTenants } from '../../hooks/useTenants';
import { useNotifications } from '../../contexts';
import { AppLayout } from '../../components/layout';

const TenantListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { tenants, loading } = useTenants();
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
    { label: 'Total Tenants', value: (Array.isArray(tenants) ? tenants.length : 0).toString(), icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active', value: activeCount.toString(), icon: UserCheck, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Inactive', value: inactiveCount.toString(), icon: UserX, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
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

      console.log('Deactivating tenants:', Array.from(selectedTenants));

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

  const clearSelection = () => {
    setSelectedTenants(new Set());
    setShowBulkActions(false);
  };

  return (
    <AppLayout title="Tenants">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage & Monitor Tenants</h1>
            <p className="text-muted-foreground">Oversee tenant information and relationships</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')} size="lg">
              <FileImage className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button onClick={() => navigate('/tenants/create')} size="lg">
              <Plus className="mr-2 h-4 w-4" /> Add Tenant
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
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
            <div className="border-t bg-muted/50 px-4 py-3">
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
                Showing {paginatedTenants.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredTenants.length)} of {filteredTenants.length} tenants
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
                          checked={selectedTenants.size === paginatedTenants.length && paginatedTenants.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Occupation</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTenants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          {filteredTenants.length === 0 && tenants.length > 0 ? 'No tenants match your filters.' : 'No tenants found. Click "Add Tenant" to create one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTenants.map((tenant) => (
                        <TableRow 
                          key={tenant.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/tenants/${tenant.id}`)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedTenants.has(tenant.id)}
                              onChange={(e) => handleSelectTenant(tenant.id, e.target.checked)}
                              className="rounded border-gray-300"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                  {tenant.firstName[0]}{tenant.lastName[0]}
                                </div>
                              </div>
                              <div>
                                <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
                                <p className="text-sm text-muted-foreground">ID: {tenant.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                                {tenant.email}
                              </div>
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                                {tenant.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Briefcase className="h-3 w-3 mr-2 text-muted-foreground" />
                              {tenant.occupation || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(tenant.status)}>
                              {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tenants/${tenant.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/tenants/${tenant.id}/edit`);
                                }}
                              >
                                <Edit className="h-4 w-4" />
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedTenants.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    {filteredTenants.length === 0 && tenants.length > 0 ? 'No tenants match your filters.' : 'No tenants found. Click "Add Tenant" to create one.'}
                  </div>
                ) : (
                  paginatedTenants.map((tenant) => (
                    <Card 
                      key={tenant.id} 
                      className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/tenants/${tenant.id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                              {tenant.firstName[0]}{tenant.lastName[0]}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{tenant.firstName} {tenant.lastName}</CardTitle>
                              <p className="text-xs text-muted-foreground">ID: {tenant.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(tenant.status)}>
                            {tenant.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{tenant.email}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{tenant.phone}</span>
                          </div>
                          {tenant.occupation && (
                            <div className="flex items-center text-muted-foreground">
                              <Briefcase className="h-4 w-4 mr-2" />
                              <span>{tenant.occupation}</span>
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
                              navigate(`/tenants/${tenant.id}`);
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
                              navigate(`/tenants/${tenant.id}/edit`);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
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
    </AppLayout>
  );
};

export default TenantListPageEnhanced;
