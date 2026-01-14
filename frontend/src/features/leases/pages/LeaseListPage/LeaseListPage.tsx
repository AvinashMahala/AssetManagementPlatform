import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, BarChart3, Settings, Plus } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/componentDesignLibrary';
import { useLeases, useDeleteLease } from '@/features/leases/hooks/useLeases';
import { useTenants } from '@/features/tenants/hooks/useTenants';
import { useUnits } from '@/features/units/hooks/useUnits';
import { AppLayout } from '@/components/layout';
import { ROUTE_PATHS } from '@/constants/routes';
import { format, isWithinInterval } from 'date-fns';
import type { Lease } from '@/features/leases/types/lease';
import type { Tenant } from '@/features/tenants/types';
import type { Unit } from '@/features/units/types';
import { LeaseList } from '@/features/leases/components/LeaseList/LeaseList';
import { LeaseFilters } from '@/features/leases/components/LeaseFilters/LeaseFilters';
import { LeaseBulkActions } from '@/features/leases/components/LeaseBulkActions/LeaseBulkActions';
import './LeaseListPage.scss';

const LeaseListPage: React.FC = () => {
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
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaseToDelete, setLeaseToDelete] = useState<{id: string, tenantName: string} | null>(null);
  
  const { leases, loading } = useLeases();
  const { tenants } = useTenants();
  const { units } = useUnits();
  const { mutate: deleteLease, loading: deleteLoading } = useDeleteLease();

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
    if (dateRange.start || dateRange.end) filters.push({ key: 'date', label: `End Date: ${dateRange.start || '...'} - ${dateRange.end || '...'}`, value: dateRange });
    if (rentRange.min || rentRange.max) filters.push({ key: 'rent', label: `Rent: ₹${rentRange.min || 0} - ₹${rentRange.max || '∞'}`, value: rentRange });
    if (selectedUnit !== 'all') {
      const unit = units.find(u => u.id === selectedUnit);
      filters.push({ key: 'unit', label: `Unit: ${unit?.unitNumber || selectedUnit}`, value: selectedUnit });
    }
    if (selectedTenant !== 'all') {
      const tenant = tenants.find(t => t.id === selectedTenant);
      filters.push({ key: 'tenant', label: `Tenant: ${tenant ? `${tenant.firstName} ${tenant.lastName}` : selectedTenant}`, value: selectedTenant });
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
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedLeases.map(l => l.id));
      setSelectedLeases(allIds);
    } else {
      setSelectedLeases(new Set());
    }
  };

  const handleBulkTerminate = async () => {
    if (selectedLeases.size === 0) return;

    setBulkActionLoading(true);
    try {
      // TODO: Implement bulk terminate API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Clear selection after successful operation
      setSelectedLeases(new Set());
    } catch (error) {
      console.error('Failed to terminate leases:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeases.size === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedLeases.size} lease${selectedLeases.size !== 1 ? 's' : ''}? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    setBulkActionLoading(true);
    try {
      // Delete leases one by one
      const deletePromises = Array.from(selectedLeases).map(id => deleteLease(id));
      await Promise.all(deletePromises);

      // Clear selection after successful operation
      setSelectedLeases(new Set());
      // TODO: Show success toast
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
  };

  const handleDeleteClick = (id: string, tenantName: string) => {
    setLeaseToDelete({ id, tenantName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!leaseToDelete) return;

    try {
      await deleteLease(leaseToDelete.id);
      setDeleteDialogOpen(false);
      setLeaseToDelete(null);
      // TODO: Show success toast
    } catch (error) {
      console.error('Failed to delete leases:', error);
      // TODO: Show error toast
    }
  };

  return (
    <AppLayout title="Leases">
      <div className="lease-list-page-enhanced space-y-2 scroll-reveal revealed">
        {/* Main 3-Tab Layout */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <Eye className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="management">
              <Settings className="w-4 h-4 mr-2" />
              Management
            </TabsTrigger>
          </TabsList>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Lease Management</h1>
              <Button onClick={() => navigate(ROUTE_PATHS.LEASES_CREATE)}>
                <Plus className="h-4 w-4 mr-2" />
                New Lease
              </Button>
            </div>

            <LeaseFilters
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortBy(field as any);
                setSortOrder(order);
              }}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              showAdvancedFilters={showAdvancedFilters}
              onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              rentRange={rentRange}
              onRentRangeChange={setRentRange}
              selectedUnit={selectedUnit}
              onUnitChange={setSelectedUnit}
              selectedTenant={selectedTenant}
              onTenantChange={setSelectedTenant}
              units={units}
              tenants={tenants}
              activeFilters={getActiveFilters()}
              onRemoveFilter={removeFilter}
              onClearAllFilters={clearAllFilters}
            />

            <LeaseBulkActions
              selectedCount={selectedLeases.size}
              onClearSelection={() => {
                setSelectedLeases(new Set());
              }}
              onTerminate={handleBulkTerminate}
              onDelete={handleBulkDelete}
              onExport={handleBulkExport}
              loading={bulkActionLoading}
            />

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                Showing {paginatedLeases.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredLeases.length)} of {filteredLeases.length} leases
              </div>
            </div>

            <LeaseList
              leases={paginatedLeases}
              viewMode={viewMode}
              loading={loading}
              selectedLeases={selectedLeases}
              onSelectLease={handleSelectLease}
              onSelectAll={handleSelectAll}
              onDelete={handleDeleteClick}
              onEdit={(id) => navigate(`/leases/${id}/edit`)}
              onView={(id) => navigate(`/leases/${id}`)}
              getTenantName={getTenantName}
              getUnitNumber={getUnitNumber}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lease</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the lease for "{leaseToDelete?.tenantName}"? This action cannot be undone and will also delete all associated payment records.
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

export default LeaseListPage;
