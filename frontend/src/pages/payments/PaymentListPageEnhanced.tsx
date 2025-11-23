import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, AlertCircle, Clock, Download, Eye, Edit, Calendar, TrendingUp, User, Home, FileImage, Filter, X, ChevronDown, ChevronUp, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination } from '../../components/ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AppLayout } from '../../components/layout';
import { usePayments, useTenants, useLeases, useUnits, useDeletePayment, useBulkDeletePayments } from '../../hooks';
import { useNotifications } from '../../contexts';
import { format, isWithinInterval } from 'date-fns';
import type { Tenant } from '../../types/tenant';
import type { Lease } from '../../types/lease';
import type { Unit } from '../../types/unit';
import type { RentPayment } from '../../types/payment';
import './PaymentListPageEnhanced.scss';

const PaymentListPageEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [selectedPayments, setSelectedPayments] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'status' | 'tenant'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});
  const [amountRange, setAmountRange] = useState<{min?: number, max?: number}>({});
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<RentPayment | null>(null);
  
  const { payments, loading, refetch } = usePayments();
  const { tenants } = useTenants();
  const { leases } = useLeases();
  const { units } = useUnits();
  const deletePayment = useDeletePayment();
  const bulkDeletePayments = useBulkDeletePayments();
  const { showSuccess, showError } = useNotifications();

  // Helper functions
  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t: Tenant) => t.id === tenantId);
    return tenant ? `${tenant.firstName} ${tenant.lastName}` : 'Unknown';
  };

  const getLeaseInfo = (payment: RentPayment) => {
    // Use unit information directly from payment if available
    if (payment.unitId && payment.unitNumber) {
      return {
        unitNumber: payment.unitNumber,
        unitId: payment.unitId
      };
    }
    
    // Fallback to looking up through lease (for backward compatibility)
    const lease = leases.find((l: Lease) => l.id === payment.leaseId);
    if (!lease) return { unitNumber: 'Unknown', unitId: '' };
    
    const unit = units.find((u: Unit) => u.id === lease.unitId);
    return {
      unitNumber: unit?.unitNumber || 'Unknown',
      unitId: lease.unitId
    };
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    
    let filtered = payments.filter(p => {
      const tenantName = getTenantName(p.tenantId);
      const { unitNumber } = getLeaseInfo(p);
      const matchesSearch = `${tenantName} ${unitNumber}`.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'overdue' ? isOverdue(p.dueDate, p.status) : p.status === statusFilter);
      const matchesMethod = paymentMethodFilter === 'all' || p.paymentMethod === paymentMethodFilter;
      
      // Advanced filters
      const matchesDateRange = (!dateRange.start || !dateRange.end) || 
        isWithinInterval(new Date(p.dueDate), { start: new Date(dateRange.start), end: new Date(dateRange.end) });
      const matchesAmountRange = (!amountRange.min || p.amount >= amountRange.min) && 
        (!amountRange.max || p.amount <= amountRange.max);
      const matchesUnit = selectedUnit === 'all' || p.unitId === selectedUnit;
      const matchesTenant = selectedTenant === 'all' || p.tenantId === selectedTenant;
      
      return matchesSearch && matchesStatus && matchesMethod && matchesDateRange && matchesAmountRange && matchesUnit && matchesTenant;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
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
  }, [payments, search, statusFilter, paymentMethodFilter, dateRange, amountRange, selectedUnit, selectedTenant, sortBy, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clear all filters
  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setDateRange({});
    setAmountRange({});
    setSelectedUnit('all');
    setSelectedTenant('all');
    setCurrentPage(1);
  };

  // Remove individual filter
  const removeFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'search':
        setSearch('');
        break;
      case 'status':
        setStatusFilter('all');
        break;
      case 'method':
        setPaymentMethodFilter('all');
        break;
      case 'date':
        setDateRange({});
        break;
      case 'amount':
        setAmountRange({});
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

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = [];
    if (search) filters.push({ key: 'search', label: `Search: "${search}"`, value: 'search' });
    if (statusFilter !== 'all') filters.push({ key: 'status', label: `Status: ${statusFilter}`, value: statusFilter });
    if (paymentMethodFilter !== 'all') filters.push({ key: 'method', label: `Method: ${paymentMethodFilter}`, value: paymentMethodFilter });
    if (dateRange.start || dateRange.end) filters.push({ key: 'date', label: `Date: ${dateRange.start || '...'} - ${dateRange.end || '...'}` });
    if (amountRange.min || amountRange.max) filters.push({ key: 'amount', label: `Amount: ₹${amountRange.min || 0} - ₹${amountRange.max || '∞'}` });
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

  // Bulk selection handlers
  const handleSelectPayment = (paymentId: string, checked: boolean) => {
    const newSelected = new Set(selectedPayments);
    if (checked) {
      newSelected.add(paymentId);
    } else {
      newSelected.delete(paymentId);
    }
    setSelectedPayments(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(paginatedPayments.map(p => p.id));
      setSelectedPayments(allIds);
      setShowBulkActions(true);
    } else {
      setSelectedPayments(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkMarkAsPaid = async () => {
    if (selectedPayments.size === 0) return;

    setBulkActionLoading(true);
    try {
      // TODO: Implement bulk update API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state to reflect changes
      // This would normally be handled by the API response and refetching data
      console.log('Marking payments as paid:', Array.from(selectedPayments));

      // Clear selection after successful operation
      setSelectedPayments(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to mark payments as paid:', error);
      // TODO: Show error toast
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedData = paginatedPayments.filter(p => selectedPayments.has(p.id));

    if (selectedData.length === 0) return;

    // Create CSV content
    const headers = ['Tenant', 'Unit', 'Amount', 'Due Date', 'Payment Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selectedData.map(payment => {
        const tenantName = getTenantName(payment.tenantId);
        const { unitNumber } = getLeaseInfo(payment);
        return [
          `"${tenantName}"`,
          `"${unitNumber}"`,
          payment.amount || '',
          `"${format(new Date(payment.dueDate), 'yyyy-MM-dd')}"`,
          `"${payment.paymentMethod?.replace('_', ' ') || 'N/A'}"`,
          `"${getStatusLabel(payment)}"`
        ].join(',');
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear selection after export
    setSelectedPayments(new Set());
    setShowBulkActions(false);
  };

  const handleSingleDelete = (payment: RentPayment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const confirmSingleDelete = async () => {
    if (!paymentToDelete) return;

    console.log('[confirmSingleDelete] Starting delete for payment:', paymentToDelete.id);
    setDeleteLoading(true);
    try {
      console.log('[confirmSingleDelete] Calling deletePayment.mutate');
      const result = await deletePayment.mutate(paymentToDelete.id);
      console.log('[confirmSingleDelete] Delete result:', result);
      
      if (result.success) {
        showSuccess(`Payment for ${getTenantName(paymentToDelete.tenantId)} has been successfully deleted.`);
        await refetch();
        console.log('[confirmSingleDelete] Refetch completed');
        setDeleteDialogOpen(false);
        setPaymentToDelete(null);
      } else {
        showError(result.error?.message || 'Failed to delete payment. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete payment:', error);
      showError('An unexpected error occurred while deleting the payment.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPayments.size === 0) return;

    console.log('[handleBulkDelete] Starting bulk delete for payments:', Array.from(selectedPayments));
    setBulkActionLoading(true);
    try {
      const idsToDelete = Array.from(selectedPayments);
      console.log('[handleBulkDelete] Calling bulkDeletePayments.mutate with ids:', idsToDelete);
      const result = await bulkDeletePayments.mutate(idsToDelete);
      console.log('[handleBulkDelete] Bulk delete result:', result);
      
      if (result.success) {
        const { deleted, failed } = result.data || { deleted: 0, failed: [] };
        
        if (deleted > 0) {
          showSuccess(`${deleted} payment${deleted !== 1 ? 's' : ''} successfully deleted.`);
        }
        
        if (failed.length > 0) {
          showError(`${failed.length} payment${failed.length !== 1 ? 's' : ''} could not be deleted. They may no longer exist or be ineligible for deletion.`);
        }
        
        await refetch();
        console.log('[handleBulkDelete] Refetch completed');
        
        // Clear selection after successful operation
        setSelectedPayments(new Set());
        setShowBulkActions(false);
      } else {
        showError(result.error?.message || 'Failed to delete payments. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete payments:', error);
      showError('An unexpected error occurred while deleting payments.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedPayments(new Set());
    setShowBulkActions(false);
  };

  const totalCollected = Array.isArray(payments) ? payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) : 0;
  const paidCount = Array.isArray(payments) ? payments.filter(p => p.status === 'paid').length : 0;
  const pendingCount = Array.isArray(payments) ? payments.filter(p => p.status === 'pending').length : 0;
  const overdueCount = Array.isArray(payments) ? payments.filter(p => p.status === 'pending' && isOverdue(p.dueDate, p.status)).length : 0;
  const pendingAmount = Array.isArray(payments) ? payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) : 0;

  const stats = [
    { 
      label: 'Total Collected', 
      value: `₹${(totalCollected / 100000).toFixed(1)}L`, 
      icon: DollarSign, 
      color: 'text-green-600', 
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      subtext: `${paidCount} payments`
    },
    { 
      label: 'Pending', 
      value: `₹${(pendingAmount / 1000).toFixed(0)}K`, 
      icon: Clock, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      subtext: `${pendingCount} payments`
    },
    { 
      label: 'Overdue', 
      value: overdueCount.toString(), 
      icon: AlertCircle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      subtext: 'Requires attention'
    },
    { 
      label: 'Collection Rate', 
      value: `${Array.isArray(payments) && payments.length > 0 ? ((paidCount / payments.length) * 100).toFixed(0) : 0}%`, 
      icon: TrendingUp, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      subtext: 'This month'
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'upi', label: 'UPI' },
    { value: 'credit_card', label: 'Credit Card' },
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
    { value: 'dueDate', label: 'Due Date' },
    { value: 'amount', label: 'Amount' },
    { value: 'status', label: 'Status' },
    { value: 'tenant', label: 'Tenant' },
  ];

  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  const getStatusVariant = (payment: any): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (isOverdue(payment.dueDate, payment.status)) return 'destructive';
    switch (payment.status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (payment: any): string => {
    if (isOverdue(payment.dueDate, payment.status)) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
    switch (payment.status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (payment: any): string => {
    if (isOverdue(payment.dueDate, payment.status)) return 'Overdue';
    return payment.status.charAt(0).toUpperCase() + payment.status.slice(1);
  };

  // Group payments by month for calendar view
  const paymentsByMonth = useMemo(() => {
    const grouped: { [key: string]: typeof payments } = {};
    filteredPayments.forEach(payment => {
      const monthKey = format(new Date(payment.dueDate), 'MMMM yyyy');
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(payment);
    });
    return grouped;
  }, [filteredPayments]);

  return (
    <AppLayout title="Payments">
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading payments...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your payment data</p>
          </div>
        </div>
      ) : (
        <div className="payment-list-page-enhanced space-y-2 scroll-reveal revealed">
        {/* Header Actions */}
        <div className="payment-list-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h1 className="header-title text-2xl font-bold text-gray-900 dark:text-white">
              Payments <span className="header-subtitle text-base font-normal text-gray-600 dark:text-gray-400">(Track rent & payments)</span>
            </h1>
          </div>
          <div className="header-actions flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/templates')}
              title="Access payment templates"
            >
              <FileImage className="mr-2 h-4 w-4" /> Templates
            </Button>
            <Button
              onClick={() => navigate('/payments/create-tabbed')}
              className="action-button bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
              title="Step-by-step guided form with progress tracking"
            >
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-section grid gap-2 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={stat.label} className={`stat-card hover:shadow-lg transition-shadow duration-200`} style={{ animationDelay: `${index * 0.1}s` }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`stat-icon-container ${stat.bgColor} p-1.5 rounded-lg`}>
                  <stat.icon className={`stat-icon h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="stat-value text-2xl font-bold">{stat.value}</div>
                <p className="stat-subtext text-xs text-muted-foreground mt-1">{stat.subtext}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overdue Alert */}
        {overdueCount > 0 && (
          <Card className="alert-card overdue-alert bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <CardTitle className="text-red-900 dark:text-red-300">
                  {overdueCount} Overdue Payment(s)
                </CardTitle>
              </div>
              <CardDescription className="text-red-800 dark:text-red-200">
                Follow up with tenants for overdue payments
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="filters-section">
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
                    placeholder="Search by tenant name, unit..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="pl-9"
                  />
                </div>

                {/* Basic Filters */}
                <div className="flex gap-2 flex-wrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort */}
                  <Select 
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [field, order] = value.split('-');
                      setSortBy(field as typeof sortBy);
                      setSortOrder(order as typeof sortOrder);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <React.Fragment key={option.value}>
                          <SelectItem value={`${option.value}-asc`}>{option.label} ↑</SelectItem>
                          <SelectItem value={`${option.value}-desc`}>{option.label} ↓</SelectItem>
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Items per page */}
                  <Select 
                    value={String(itemsPerPage)}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {itemsPerPageOptions.map(option => (
                        <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
                      <label className="text-sm font-medium">Due Date Range</label>
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

                    {/* Amount Range */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount Range (₹)</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={amountRange.min || ''}
                          onChange={(e) => setAmountRange(prev => ({ ...prev, min: Number(e.target.value) || undefined }))}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={amountRange.max || ''}
                          onChange={(e) => setAmountRange(prev => ({ ...prev, max: Number(e.target.value) || undefined }))}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Unit Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Unit</label>
                      <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tenant Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tenant</label>
                      <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenantOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          {/* Bulk Actions Toolbar */}
          {showBulkActions && selectedPayments.size > 0 && (
            <div className="bulk-actions-toolbar border-t bg-muted/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedPayments.size} payment{selectedPayments.size !== 1 ? 's' : ''} selected
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
                    variant="default"
                    size="sm"
                    onClick={handleBulkMarkAsPaid}
                    disabled={bulkActionLoading}
                  >
                    {bulkActionLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Mark as Paid
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
                Showing {paginatedPayments.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredPayments.length)} of {filteredPayments.length} payments
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="table-view rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-50 dark:bg-blue-950 hover:bg-blue-50 dark:hover:bg-blue-950">
                      <TableHead className="w-12 px-2 py-1 text-xs">
                        <input
                          type="checkbox"
                          checked={selectedPayments.size === paginatedPayments.length && paginatedPayments.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead className="px-2 py-1 text-xs">Tenant</TableHead>
                      <TableHead className="px-2 py-1 text-xs">Unit</TableHead>
                      <TableHead className="px-2 py-1 text-xs">Amount</TableHead>
                      <TableHead className="px-2 py-1 text-xs">Due Date</TableHead>
                      <TableHead className="px-2 py-1 text-xs">Payment Method</TableHead>
                      <TableHead className="px-2 py-1 text-xs">Status</TableHead>
                      <TableHead className="px-2 py-1 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                          {filteredPayments.length === 0 && payments.length > 0 ? 'No payments match your filters.' : 'No payments recorded yet. Click "Record Payment" to add one.'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayments.map((payment: RentPayment) => {
                        const { unitNumber } = getLeaseInfo(payment);
                        const tenantName = getTenantName(payment.tenantId);
                        const overdue = isOverdue(payment.dueDate, payment.status);
                        
                        return (
                          <TableRow 
                            key={payment.id} 
                            className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20"
                            onClick={() => navigate(`/payments/${payment.id}`)}
                          >
                            <TableCell className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedPayments.has(payment.id)}
                                onChange={(e) => handleSelectPayment(payment.id, e.target.checked)}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{tenantName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs">
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span>{unitNumber}</span>
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs amount-cell font-bold text-primary">
                              ₹{payment.amount?.toLocaleString() || 'N/A'}
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                                </div>
                                {overdue && (
                                  <div className="text-xs text-red-600 font-medium">
                                    {Math.abs(Math.ceil((new Date().getTime() - new Date(payment.dueDate).getTime()) / (1000 * 60 * 60 * 24)))} days overdue
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs capitalize">
                              {payment.paymentMethod?.replace('_', ' ') || 'N/A'}
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs status-cell">
                              <Badge variant={getStatusVariant(payment)} className={`status-badge ${getStatusColor(payment)}`}>
                                {getStatusLabel(payment)}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-2 py-1 text-xs actions-cell text-right">
                              <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="View Details"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/payments/${payment.id}`);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  title="Edit Payment"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/payments/${payment.id}/edit`);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                {payment.status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete Payment"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSingleDelete(payment);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Monthly Summary */}
        {Object.keys(paymentsByMonth).length > 0 && (
          <Card className="monthly-summary">
            <CardHeader className="summary-header">
              <CardTitle className="summary-title">Monthly Summary</CardTitle>
              <CardDescription className="summary-description">Payment breakdown by month</CardDescription>
            </CardHeader>
            <CardContent className="summary-content">
              <div className="space-y-4">
                {Object.entries(paymentsByMonth).slice(0, 3).map(([month, monthPayments]) => {
                  const monthTotal = monthPayments.reduce((sum: number, p: RentPayment) => sum + (p.status === 'paid' ? p.amount : 0), 0);
                  const monthPending = monthPayments.reduce((sum: number, p: RentPayment) => sum + (p.status === 'pending' ? p.amount : 0), 0);
                  
                  return (
                    <div key={month} className="month-card flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="month-info flex items-center space-x-4">
                        <div className="month-icon-container bg-primary/10 p-3 rounded-lg">
                          <Calendar className="month-icon h-5 w-5 text-primary" />
                        </div>
                        <div className="month-details">
                          <p className="month-name font-semibold">{month}</p>
                          <p className="month-count text-sm text-muted-foreground">{monthPayments.length} payments</p>
                        </div>
                      </div>
                      <div className="month-amounts text-right">
                        <p className="collected-amount font-bold text-green-600">₹{monthTotal.toLocaleString()}</p>
                        {monthPending > 0 && (
                          <p className="pending-amount text-sm text-orange-600">₹{monthPending.toLocaleString()} pending</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment? This action cannot be undone.
              Only pending payments can be deleted.
            </DialogDescription>
          </DialogHeader>
          {paymentToDelete && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Tenant:</span>
                  <span className="text-sm">{getTenantName(paymentToDelete.tenantId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Unit:</span>
                  <span className="text-sm">{getLeaseInfo(paymentToDelete).unitNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm font-semibold">₹{paymentToDelete.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Due Date:</span>
                  <span className="text-sm">{format(new Date(paymentToDelete.dueDate), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={getStatusVariant(paymentToDelete)} className={getStatusColor(paymentToDelete)}>
                    {getStatusLabel(paymentToDelete)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
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
              onClick={confirmSingleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default PaymentListPageEnhanced;
