import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, CheckCircle2, XCircle, Clock, AlertTriangle, Calendar, Eye, Edit, User, Home, FileImage, Filter, X, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination } from '../../components/ui/pagination';
import { useLeases } from '../../hooks/useLeases';
import { useTenants } from '../../hooks/useTenants';
import { useUnits } from '../../hooks/useUnits';
import { AppLayout } from '../../components/layout';
import { format, isWithinInterval } from 'date-fns';
import type { Lease } from '../../types/lease';
import type { Tenant } from '../../types/tenant';
import type { Unit } from '../../types/unit';

const LeaseListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('timeline');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'endDate' | 'monthlyRent' | 'status' | 'tenant'>('endDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});
  const [rentRange, setRentRange] = useState<{min?: number, max?: number}>({});
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedLeases, setSelectedLeases] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  const { leases, loading } = useLeases();
  const { tenants } = useTenants();
  const { units } = useUnits();

  // Helper functions
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getUnitNumber = (lease: Lease) => {
    // Use unit number directly from lease if available
    if (lease.unitNumber) {
      return lease.unitNumber;
    }
    
    // Fallback to looking up by unitId
    const unit = units.find((u: Unit) => u.id === lease.unitId);
    return unit?.unitNumber || 'Unknown';
  };

  const getDaysUntilExpiry = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isExpiringSoon = (endDate: string) => {
    const days = getDaysUntilExpiry(endDate);
    return days > 0 && days <= 30;
  };

  const filteredLeases = useMemo(() => {
    if (!Array.isArray(leases)) return [];
    
    let filtered = leases.filter(lease => {
      const tenantName = getTenantName(lease.tenantId);
      const unitNumber = getUnitNumber(lease);
      const matchesSearch = `${tenantName} ${unitNumber}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || lease.status === statusFilter;
      
      // Advanced filters
      const matchesDateRange = (!dateRange.start || !dateRange.end) || 
        isWithinInterval(new Date(lease.endDate), { start: new Date(dateRange.start), end: new Date(dateRange.end) });
      const matchesRentRange = (!rentRange.min || lease.monthlyRent >= rentRange.min) && 
        (!rentRange.max || lease.monthlyRent <= rentRange.max);
      const matchesUnit = selectedUnit === 'all' || lease.unitId === selectedUnit;
      const matchesTenant = selectedTenant === 'all' || lease.tenantId === selectedTenant;
      
      return matchesSearch && matchesStatus && matchesDateRange && matchesRentRange && matchesUnit && matchesTenant;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        case 'monthlyRent':
          aValue = a.monthlyRent;
          bValue = b.monthlyRent;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'tenant':
          aValue = getTenantName(a.tenantId);
          bValue = getTenantName(b.tenantId);
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [leases, search, statusFilter, dateRange, rentRange, selectedUnit, selectedTenant, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLeases.length / itemsPerPage);
  const paginatedLeases = filteredLeases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear all filters
  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateRange({});
    setRentRange({});
    setSelectedUnit('all');
    setSelectedTenant('all');
    setCurrentPage(1);
  };

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [];
    if (search) filters.push({ key: 'search', label: `Search: "${search}"`, value: 'search' });
    if (statusFilter !== 'all') filters.push({ key: 'status', label: `Status: ${statusFilter}`, value: statusFilter });
    if (dateRange.start || dateRange.end) filters.push({ key: 'date', label: `End Date: ${dateRange.start || '...'} - ${dateRange.end || '...'}` });
    if (rentRange.min || rentRange.max) filters.push({ key: 'rent', label: `Rent: ₹${rentRange.min || 0} - ₹${rentRange.max || '∞'}` });
    if (selectedUnit !== 'all') {
      const unit = units.find(u => u.id === selectedUnit);
      filters.push({ key: 'unit', label: `Unit: ${unit?.unitNumber || selectedUnit}` });
    }
    if (selectedTenant !== 'all') {
      const tenant = tenants.find(t => t.id === selectedTenant);
      filters.push({ key: 'tenant', label: `Tenant: ${tenant ? `${tenant.firstName} ${tenant.lastName}` : selectedTenant}` });
    }
    return filters;
  };

  // Remove specific filter
  const removeFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'search':
        setSearch('');
        break;
      case 'status':
        setStatusFilter('all');
        break;
      case 'date':
        setDateRange({});
        break;
      case 'rent':
        setRentRange({});
        break;
      case 'unit':
        setSelectedUnit('all');
        break;
      case 'tenant':
        setSelectedTenant('all');
        break;
    }
    setCurrentPage(1);
  };

  // Bulk selection handlers
  const handleSelectLease = (leaseId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeases);
    if (checked) {
      newSelected.add(leaseId);
    } else {
      newSelected.delete(leaseId);
    }
    setSelectedLeases(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedLeases.map(l => l.id));
      setSelectedLeases(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedLeases(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkTerminate = async () => {
    if (selectedLeases.size === 0) return;

    setBulkActionLoading(true);
    try {
      // TODO: Implement bulk terminate API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Terminating leases:', Array.from(selectedLeases));

      // Clear selection after successful operation
      setSelectedLeases(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to terminate leases:', error);
      // TODO: Show error toast
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = paginatedLeases.filter(l => selectedLeases.has(l.id));

    if (selectedData.length === 0) return;

    // Create CSV content
    const headers = ['Tenant', 'Unit', 'Start Date', 'End Date', 'Monthly Rent', 'Security Deposit', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(lease => {
        const tenantName = getTenantName(lease.tenantId);
        const unitNumber = getUnitNumber(lease);
        return [
          `"${tenantName}"`,
          `"${unitNumber}"`,
          `"${format(new Date(lease.startDate), 'yyyy-MM-dd')}"`,
          `"${format(new Date(lease.endDate), 'yyyy-MM-dd')}"`,
          lease.monthlyRent || '',
          lease.securityDeposit || '',
          `"${lease.status}"`
        ].join(',');
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leases_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear selection after export
    setSelectedLeases(new Set());
    setShowBulkActions(false);
  };

  const clearSelection = () => {
    setSelectedLeases(new Set());
    setShowBulkActions(false);
  };

  const activeCount = Array.isArray(leases) ? leases.filter(l => l.status === 'active').length : 0;
  const expiredCount = Array.isArray(leases) ? leases.filter(l => l.status === 'expired').length : 0;
  const expiringCount = Array.isArray(leases) ? leases.filter(l => l.status === 'active' && isExpiringSoon(l.endDate)).length : 0;

  const stats = [
    { label: 'Total Leases', value: (Array.isArray(leases) ? leases.length : 0).toString(), icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active', value: activeCount.toString(), icon: CheckCircle2, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Expiring Soon', value: expiringCount.toString(), icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Expired', value: expiredCount.toString(), icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending', label: 'Pending' },
    { value: 'terminated', label: 'Terminated' },
  ];

  const unitOptions = [
    { value: 'all', label: 'All Units' },
    ...units.map(unit => ({ value: unit.id, label: unit.unitNumber }))
  ];

  const tenantOptions = [
    { value: 'all', label: 'All Tenants' },
    ...tenants.map(tenant => ({ value: tenant.id, label: `${tenant.firstName} ${tenant.lastName}` }))
  ];

  const sortOptions = [
    { value: 'endDate', label: 'End Date' },
    { value: 'monthlyRent', label: 'Monthly Rent' },
    { value: 'status', label: 'Status' },
    { value: 'tenant', label: 'Tenant' },
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
      case 'expired': return 'destructive';
      case 'pending': return 'secondary';
      case 'terminated': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (lease: Lease): string => {
    if (lease.status === 'active' && isExpiringSoon(lease.endDate)) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    }
    switch (lease.status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'terminated': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout title="Leases">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Agreements & Renewals</h1>
            <p className="text-muted-foreground">Track lease agreements and monitor renewals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/templates')} size="lg">
              <FileImage className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button onClick={() => navigate('/leases/create')} size="lg">
              <Plus className="mr-2 h-4 w-4" /> Create Lease
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

        {/* Expiring Soon Alert */}
        {expiringCount > 0 && (
          <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-amber-900 dark:text-amber-300">
                  {expiringCount} Lease(s) Expiring Soon
                </CardTitle>
              </div>
              <CardDescription className="text-amber-800 dark:text-amber-200">
                Review and renew leases expiring within the next 30 days
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              {/* Active Filters */}
              {getActiveFilters().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                  {getActiveFilters().map((filter) => (
                    <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                      {filter.label}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive" 
                        onClick={() => removeFilter(filter.key)}
                      />
                    </Badge>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by tenant name, unit number..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="pl-9"
                  />
                </div>

                {/* Basic Filters */}
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  {/* Sort */}
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field as typeof sortBy);
                      setSortOrder(order as typeof sortOrder);
                    }}
                    className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sortOptions.map(option => (
                      <>
                        <option key={`${option.value}-asc`} value={`${option.value}-asc`}>{option.label} ↑</option>
                        <option key={`${option.value}-desc`} value={`${option.value}-desc`}>{option.label} ↓</option>
                      </>
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
                      variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('timeline')}
                      className="rounded-l-none"
                    >
                      Timeline
                    </Button>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced
                    {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                  </Button>

                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date Range</label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          placeholder="Start date"
                          value={dateRange.start || ''}
                          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="flex-1"
                        />
                        <Input
                          type="date"
                          placeholder="End date"
                          value={dateRange.end || ''}
                          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Rent Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Monthly Rent Range (₹)</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={rentRange.min || ''}
                          onChange={(e) => setRentRange(prev => ({ ...prev, min: Number(e.target.value) || undefined }))}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={rentRange.max || ''}
                          onChange={(e) => setRentRange(prev => ({ ...prev, max: Number(e.target.value) || undefined }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Unit Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit</label>
                      <select
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {unitOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Tenant Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tenant</label>
                      <select
                        value={selectedTenant}
                        onChange={(e) => setSelectedTenant(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {tenantOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          {/* Bulk Actions Toolbar */}
          {showBulkActions && selectedLeases.size > 0 && (
            <div className="border-t bg-muted/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedLeases.size} lease{selectedLeases.size !== 1 ? 's' : ''} selected
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
                    onClick={handleBulkTerminate}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Terminate Selected
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
                Showing {paginatedLeases.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredLeases.length)} of {filteredLeases.length} leases
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
                          checked={selectedLeases.size === paginatedLeases.length && paginatedLeases.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLeases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                          {filteredLeases.length === 0 && leases.length > 0 ? 'No leases match your filters.' : 'No leases found. Click "Create Lease" to create one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLeases.map((lease: Lease) => {
                        const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
                        const expiringSoon = isExpiringSoon(lease.endDate);
                        
                        return (
                          <TableRow 
                            key={lease.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/leases/${lease.id}`)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedLeases.has(lease.id)}
                                onChange={(e) => handleSelectLease(lease.id, e.target.checked)}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{getTenantName(lease.tenantId)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span>{getUnitNumber(lease)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {format(new Date(lease.startDate), 'MMM dd, yyyy')} - {format(new Date(lease.endDate), 'MMM dd, yyyy')}
                                </div>
                                {lease.status === 'active' && expiringSoon && (
                                  <div className="flex items-center text-xs text-orange-600">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Expires in {daysUntilExpiry} days
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">₹{lease.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(lease.status)} className={getStatusColor(lease)}>
                                {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/leases/${lease.id}`);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/leases/${lease.id}/edit`);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              /* Timeline View */
              <div className="space-y-4">
                {paginatedLeases.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {filteredLeases.length === 0 && leases.length > 0 ? 'No leases match your filters.' : 'No leases found. Click "Create Lease" to create one.'}
                  </div>
                ) : (
                  paginatedLeases.map((lease: Lease, index: number) => {
                    const daysUntilExpiry = getDaysUntilExpiry(lease.endDate);
                    const expiringSoon = isExpiringSoon(lease.endDate);
                    const isExpired = lease.status === 'expired' || daysUntilExpiry < 0;
                    
                    return (
                      <div key={lease.id} className="relative">
                        {/* Timeline connector */}
                        {index !== paginatedLeases.length - 1 && (
                          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-border" />
                        )}
                        
                        <Card 
                          className="hover:shadow-lg transition-all duration-200 cursor-pointer relative"
                          onClick={() => navigate(`/leases/${lease.id}`)}
                        >
                          {/* Timeline dot */}
                          <div className={`absolute left-0 top-6 w-12 flex items-center justify-center`}>
                            <div className={`h-4 w-4 rounded-full border-2 border-white ${
                              lease.status === 'active' && expiringSoon ? 'bg-orange-500' :
                              lease.status === 'active' ? 'bg-green-500' :
                              isExpired ? 'bg-red-500' :
                              'bg-gray-400'
                            }`} />
                          </div>
                          
                          <CardHeader className="pl-16">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {getTenantName(lease.tenantId)}
                                  <span className="text-muted-foreground">•</span>
                                  <Home className="h-4 w-4" />
                                  Unit {getUnitNumber(lease)}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(lease.startDate), 'MMM dd, yyyy')} - {format(new Date(lease.endDate), 'MMM dd, yyyy')}
                                </CardDescription>
                              </div>
                              <Badge variant={getStatusVariant(lease.status)} className={getStatusColor(lease)}>
                                {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pl-16">
                            <div className="flex flex-wrap items-center gap-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">Monthly Rent:</span>
                                <span className="ml-2 font-bold text-primary">₹{lease.monthlyRent?.toLocaleString() || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Security Deposit:</span>
                                <span className="ml-2 font-medium">₹{lease.securityDeposit?.toLocaleString() || 'N/A'}</span>
                              </div>
                              {lease.status === 'active' && (
                                <div className={`flex items-center gap-1 ${expiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">
                                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : 'Expired'}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {expiringSoon && lease.status === 'active' && (
                              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-md">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-sm text-amber-800 dark:text-amber-200">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Renewal required soon
                                  </div>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Navigate to renewal or edit
                                      navigate(`/leases/${lease.id}/edit`);
                                    }}
                                    className="border-amber-300 hover:bg-amber-100"
                                  >
                                    Renew
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/leases/${lease.id}`);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/leases/${lease.id}/edit`);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })
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

export default LeaseListPageEnhanced;
