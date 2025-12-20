import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, Download, Eye, Edit, TrendingUp, Building2, Home, Filter, X, ChevronDown, ChevronUp, CheckCircle, Archive, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import { Input } from '@/componentDesignLibrary';
import { Badge } from '@/componentDesignLibrary';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/componentDesignLibrary';
import { Pagination } from '@/componentDesignLibrary';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/componentDesignLibrary';
import { AppLayout } from '@/components/layout';
import { useExpenses, useProperties, useUnits, useDeleteExpense, useArchiveExpense } from '@/hooks';
import { format, isWithinInterval } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Property } from '@/features/properties/types';
import type { Unit } from '@/features/units/types';
import type { ExpenseWithDetails, ExpenseTypeValue, ExpenseFrequencyValue, ExpenseDistributionValue, ExpenseStatusValue } from '@/features/finance/types';
import { getErrorMessage } from '@/types/api';

const ExpenseListPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [distributionFilter, setDistributionFilter] = useState<string>('all');
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<'startDate' | 'amount' | 'type' | 'status'>('startDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{start?: string, end?: string}>({});
  const [amountRange, setAmountRange] = useState<{min?: number, max?: number}>({});
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseWithDetails | null>(null);

  // Bulk delete confirmation dialog
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const { expenses, loading, refetch } = useExpenses();
  const { properties } = useProperties();
  const { units } = useUnits();
  const deleteExpense = useDeleteExpense();
  const archiveExpense = useArchiveExpense();
  const { showSuccess, showError } = useNotifications();

  // Helper functions
  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p: Property) => p.id === propertyId);
    return property ? property.name : 'Unknown';
  };

  const getUnitInfo = (unitId?: string) => {
    if (!unitId) return null;
    const unit = units.find((u: Unit) => u.id === unitId);
    return unit ? { name: unit.unitName || `Unit ${unit.unitNumber}`, number: unit.unitNumber } : null;
  };

  const getExpenseTypeLabel = (type: ExpenseTypeValue) => {
    const labels: Record<ExpenseTypeValue, string> = {
      wifi_internet: 'WiFi/Internet',
      food_meals: 'Food/Meals',
      inverter_generator: 'Inverter/Generator',
      cable_dish: 'Cable/Dish',
      surveillance_cameras: 'Surveillance Cameras',
      laundry: 'Laundry',
      water_bill: 'Water Bill',
      plumbing: 'Plumbing',
      water_heater: 'Water Heater',
      ac_repair: 'AC Repair',
      furniture_repair: 'Furniture Repair',
      cleaning: 'Cleaning',
      housekeeping: 'Housekeeping',
      painting: 'Painting',
      electrical_work: 'Electrical Work',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getFrequencyLabel = (frequency: ExpenseFrequencyValue) => {
    const labels: Record<ExpenseFrequencyValue, string> = {
      one_time: 'One-time',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly'
    };
    return labels[frequency] || frequency;
  };

  const getDistributionLabel = (distribution: ExpenseDistributionValue) => {
    const labels: Record<ExpenseDistributionValue, string> = {
      owner_only: 'Owner Only',
      split_among_tenants: 'Split Among Tenants',
      specific_units: 'Specific Units'
    };
    return labels[distribution] || distribution;
  };

  const getStatusBadge = (status: ExpenseStatusValue, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filtered and sorted expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense: ExpenseWithDetails) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          expense.description.toLowerCase().includes(searchLower) ||
          getExpenseTypeLabel(expense.type).toLowerCase().includes(searchLower) ||
          getPropertyName(expense.propertyId).toLowerCase().includes(searchLower) ||
          (expense.unit && expense.unit.unitNumber.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !expense.isActive) return false;
        if (statusFilter === 'inactive' && expense.isActive) return false;
        if (statusFilter !== 'active' && statusFilter !== 'inactive' && expense.status !== statusFilter) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && expense.type !== typeFilter) return false;

      // Frequency filter
      if (frequencyFilter !== 'all' && expense.frequency !== frequencyFilter) return false;

      // Distribution filter
      if (distributionFilter !== 'all' && expense.distribution !== distributionFilter) return false;

      // Property filter
      if (selectedProperty !== 'all' && expense.propertyId !== selectedProperty) return false;

      // Unit filter
      if (selectedUnit !== 'all' && expense.unitId !== selectedUnit) return false;

      // Date range filter
      if (dateRange.start || dateRange.end) {
        const expenseDate = new Date(expense.startDate);
        if (dateRange.start && dateRange.end) {
          if (!isWithinInterval(expenseDate, {
            start: new Date(dateRange.start),
            end: new Date(dateRange.end)
          })) return false;
        } else if (dateRange.start) {
          if (expenseDate < new Date(dateRange.start)) return false;
        } else if (dateRange.end) {
          if (expenseDate > new Date(dateRange.end)) return false;
        }
      }

      // Amount range filter
      if (amountRange.min !== undefined && expense.amount < amountRange.min) return false;
      if (amountRange.max !== undefined && expense.amount > amountRange.max) return false;

      return true;
    });

    // Sort
    filtered.sort((a: ExpenseWithDetails, b: ExpenseWithDetails) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'startDate':
          aValue = new Date(a.startDate);
          bValue = new Date(b.startDate);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'type':
          aValue = getExpenseTypeLabel(a.type);
          bValue = getExpenseTypeLabel(b.type);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [expenses, search, statusFilter, typeFilter, frequencyFilter, distributionFilter, selectedProperty, selectedUnit, dateRange, amountRange, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredAndSortedExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = useMemo(() => {
    const total = filteredAndSortedExpenses.length;
    const active = filteredAndSortedExpenses.filter((e: ExpenseWithDetails) => e.isActive).length;
    const totalAmount = filteredAndSortedExpenses.reduce((sum: number, e: ExpenseWithDetails) => sum + e.amount, 0);

    return { total, active, totalAmount };
  }, [filteredAndSortedExpenses]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedExpenses(new Set(paginatedExpenses.map(e => e.id)));
    } else {
      setSelectedExpenses(new Set());
    }
  };

  const handleSelectExpense = (expenseId: string, checked: boolean) => {
    const newSelected = new Set(selectedExpenses);
    if (checked) {
      newSelected.add(expenseId);
    } else {
      newSelected.delete(expenseId);
    }
    setSelectedExpenses(newSelected);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setFrequencyFilter('all');
    setDistributionFilter('all');
    setSelectedProperty('all');
    setSelectedUnit('all');
    setDateRange({});
    setAmountRange({});
  };

  const handleDeleteClick = (expense: ExpenseWithDetails) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;

    try {
      await deleteExpense.mutate(expenseToDelete.id);
      showSuccess('Expense Deleted', `Successfully deleted "${expenseToDelete.description}"`);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
      // Refresh the expenses list
      refetch();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      showError('Delete Failed', getErrorMessage(deleteExpense.error) || 'An unexpected error occurred while deleting the expense');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const handleBulkDeleteClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    setBulkActionLoading(true);
    try {
      const deletePromises = Array.from(selectedExpenses).map(id =>
        deleteExpense.mutate(id)
      );

      await Promise.all(deletePromises);

      showSuccess('Expenses Deleted', `Successfully deleted ${selectedExpenses.size} expense${selectedExpenses.size > 1 ? 's' : ''}`);
      setBulkDeleteDialogOpen(false);
      setSelectedExpenses(new Set());
      setShowBulkActions(false);
      // Refresh the expenses list
      refetch();
    } catch (error) {
      console.error('Failed to delete expenses:', error);
      showError('Bulk Delete Failed', 'Some expenses could not be deleted. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialogOpen(false);
  };

  const handleBulkArchiveClick = () => {
    handleBulkArchive();
  };

  const handleBulkArchive = async () => {
    setBulkActionLoading(true);
    try {
      const archivePromises = Array.from(selectedExpenses).map(id =>
        archiveExpense.mutate(id)
      );

      await Promise.all(archivePromises);

      showSuccess('Expenses Archived', `Successfully archived ${selectedExpenses.size} expense${selectedExpenses.size > 1 ? 's' : ''}`);
      setSelectedExpenses(new Set());
      setShowBulkActions(false);
      // Refresh the expenses list
      refetch();
    } catch (error) {
      console.error('Failed to archive expenses:', error);
      showError('Bulk Archive Failed', 'Some expenses could not be archived. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkExport = () => {
    setBulkActionLoading(true);
    try {
      const selectedData = expenses.filter(expense => selectedExpenses.has(expense.id));

      if (selectedData.length === 0) {
        showError('Export Failed', 'No expenses selected for export');
        return;
      }

      // Create CSV content
      const headers = ['Description', 'Type', 'Amount', 'Frequency', 'Distribution', 'Property', 'Unit', 'Start Date', 'Status'];
      const csvContent = [
        headers.join(','),
        ...selectedData.map(expense => [
          `"${expense.description}"`,
          `"${getExpenseTypeLabel(expense.type)}"`,
          expense.amount,
          `"${getFrequencyLabel(expense.frequency)}"`,
          `"${getDistributionLabel(expense.distribution)}"`,
          `"${getPropertyName(expense.propertyId)}"`,
          `"${expense.unit ? expense.unit.name : 'Property-wide'}"`,
          `"${format(new Date(expense.startDate), 'yyyy-MM-dd')}"`,
          `"${expense.status}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess('Export Complete', `Successfully exported ${selectedData.length} expense${selectedData.length > 1 ? 's' : ''} to CSV`);
      setSelectedExpenses(new Set());
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to export expenses:', error);
      showError('Export Failed', 'Failed to export expenses. Please try again.');
    } finally {
      setBulkActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading expenses...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">Loading expenses...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your expense data</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expenses</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage property and unit expenses
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/expenses/create-tabbed')}
              title="Step-by-step guided form with progress tracking"
              size="lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all expenses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Expenses</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="ml-auto"
              >
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Advanced
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="wifi_internet">WiFi/Internet</option>
                <option value="water_bill">Water Bill</option>
                <option value="cleaning">Cleaning</option>
                <option value="electrical_work">Electrical Work</option>
                <option value="plumbing">Plumbing</option>
                <option value="ac_repair">AC Repair</option>
                <option value="other">Other</option>
              </select>

              <select
                value={frequencyFilter}
                onChange={(e) => setFrequencyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Frequencies</option>
                <option value="one_time">One-time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Properties</option>
                  {properties.map((property: Property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Units</option>
                  {units.map((unit: Unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.unitName || `Unit ${unit.unitNumber}`}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min Amount"
                    value={amountRange.min || ''}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max Amount"
                    value={amountRange.max || ''}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
              <div className="text-sm text-gray-600">
                Showing {paginatedExpenses.length} of {filteredAndSortedExpenses.length} expenses
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedExpenses.size > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedExpenses.size} expense{selectedExpenses.size > 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkActions(!showBulkActions)}
                  >
                    Bulk Actions
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExpenses(new Set())}
                >
                  Clear Selection
                </Button>
              </div>

              {showBulkActions && (
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={handleBulkArchiveClick} disabled={bulkActionLoading}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive Selected
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleBulkExport} disabled={bulkActionLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDeleteClick}
                    disabled={bulkActionLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Expenses Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={paginatedExpenses.length > 0 && selectedExpenses.size === paginatedExpenses.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {sortBy === 'type' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      {sortBy === 'amount' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center gap-2">
                      Start Date
                      {sortBy === 'startDate' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {sortBy === 'status' && (
                        sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedExpenses.map((expense: ExpenseWithDetails) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedExpenses.has(expense.id)}
                        onChange={(e) => handleSelectExpense(expense.id, e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getExpenseTypeLabel(expense.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={expense.description}>
                        {expense.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="truncate max-w-32" title={getPropertyName(expense.propertyId)}>
                          {getPropertyName(expense.propertyId)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUnitInfo(expense.unitId) ? (
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-gray-400" />
                          <span>{getUnitInfo(expense.unitId)?.number}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Property-wide</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{expense.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getFrequencyLabel(expense.frequency)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getDistributionLabel(expense.distribution)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(expense.startDate), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(expense.status, expense.isActive)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/expenses/${expense.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(expense)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {paginatedExpenses.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-600 mb-4">
                  {filteredAndSortedExpenses.length === 0 && expenses.length > 0
                    ? 'Try adjusting your filters to see more expenses.'
                    : 'Get started by adding your first expense.'}
                </p>
                <Button onClick={() => navigate('/expenses/create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          {/* Custom backdrop */}
          {deleteDialogOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          )}
          <DialogContent className="bg-white dark:bg-gray-900 border shadow-xl z-50">
            <DialogHeader>
              <DialogTitle>Delete Expense</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this expense? This action cannot be undone.
                {expenseToDelete && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="font-medium">{expenseToDelete.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getExpenseTypeLabel(expenseToDelete.type)} • ₹{expenseToDelete.amount.toLocaleString()} • {getPropertyName(expenseToDelete.propertyId)}
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteExpense.loading}
              >
                {deleteExpense.loading ? 'Deleting...' : 'Delete Expense'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Delete Confirmation Dialog */}
        <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
          {/* Custom backdrop */}
          {bulkDeleteDialogOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
          )}
          <DialogContent className="bg-white dark:bg-gray-900 border shadow-xl z-50">
            <DialogHeader>
              <DialogTitle>Delete Selected Expenses</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedExpenses.size} expense{selectedExpenses.size > 1 ? 's' : ''}?
                This action cannot be undone.
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                    ⚠️ This will permanently delete all selected expenses
                  </p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleBulkDeleteCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDeleteConfirm}
                disabled={deleteExpense.loading}
              >
                {deleteExpense.loading ? 'Deleting...' : `Delete ${selectedExpenses.size} Expense${selectedExpenses.size > 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      )}
    </AppLayout>
  );
};

export default ExpenseListPage;