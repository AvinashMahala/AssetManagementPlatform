import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, DollarSign, TrendingUp, Building2, Home, Filter, X, ChevronDown, ChevronUp, CheckCircle, Archive, Trash2, Eye, Edit, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination } from '../../components/ui/pagination';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AppLayout } from '../../components/layout';
import { useExpenses, useProperties, useUnits, useDeleteExpense, useArchiveExpense } from '../../hooks';
import { format, isWithinInterval } from 'date-fns';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Property } from '../../types/property';
import type { Unit } from '../../types/unit';
import type { ExpenseWithDetails, ExpenseTypeValue, ExpenseFrequencyValue, ExpenseDistributionValue, ExpenseStatusValue } from '../../types/expense';
import { getErrorMessage } from '../../types/api';
import './ExpenseListPageEnhanced.scss';

const ExpenseListPageEnhanced: React.FC = () => {
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
        <div className="expense-list-page-enhanced">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="expense-list-page-enhanced space-y-2">
        {/* Header */}
        <div className="expense-list-header flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
          <div>
            <h1 className="header-title text-2xl font-bold text-gray-900 dark:text-white">
              Expenses <span className="header-subtitle text-base font-normal text-gray-600 dark:text-gray-400">(Track property expenses)</span>
            </h1>
          </div>
          <div className="header-actions flex gap-2">
            <Button
              onClick={() => navigate('/expenses/create-tabbed')}
              className="action-button bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition-all duration-300"
              title="Add a new expense record"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-section grid gap-2 md:grid-cols-3">
          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Expenses</CardTitle>
              <div className="stat-icon-container bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-lg">
                <DollarSign className="stat-icon h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="stat-value text-2xl font-bold">{stats.total}</div>
              <p className="stat-subtext text-xs text-muted-foreground mt-1">{stats.active} active</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Amount</CardTitle>
              <div className="stat-icon-container bg-green-50 dark:bg-green-900/20 p-1.5 rounded-lg">
                <TrendingUp className="stat-icon h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="stat-value text-2xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
              <p className="stat-subtext text-xs text-muted-foreground mt-1">Across all expenses</p>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">Active Expenses</CardTitle>
              <div className="stat-icon-container bg-orange-50 dark:bg-orange-900/20 p-1.5 rounded-lg">
                <CheckCircle className="stat-icon h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="stat-value text-2xl font-bold">{stats.active}</div>
              <p className="stat-subtext text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="filters-section">
          <CardHeader className="filters-header">
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
          <CardContent className="filters-content">
            {/* Basic Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="search-container">
                <Search className="search-icon" />
                <Input
                  placeholder="Search expenses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="wifi_internet">WiFi/Internet</SelectItem>
                  <SelectItem value="water_bill">Water Bill</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="electrical_work">Electrical Work</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="ac_repair">AC Repair</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={frequencyFilter} onValueChange={setFrequencyFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map((property: Property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {units.map((unit: Unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.unitName || `Unit ${unit.unitNumber}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="filter-input"
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={dateRange.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="filter-input"
                  />

                  <Input
                    type="number"
                    placeholder="Min Amount"
                    value={amountRange.min || ''}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : undefined }))}
                    className="filter-input"
                  />
                  <Input
                    type="number"
                    placeholder="Max Amount"
                    value={amountRange.max || ''}
                    onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : undefined }))}
                    className="filter-input"
                  />
                </div>
              </div>
            )}

            {/* Clear Filters */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              <div className="text-sm text-muted-foreground">
                Showing {paginatedExpenses.length} of {filteredAndSortedExpenses.length} expenses
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedExpenses.size > 0 && (
          <div className="bulk-actions-toolbar">
            <div className="bulk-info">
              <span className="selection-count">
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
            <div className="bulk-actions">
              {showBulkActions && (
                <>
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
                </>
              )}
            </div>
          </div>
        )}

        {/* Expenses Table */}
        <div className="table-view rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50 dark:bg-blue-950 hover:bg-blue-50 dark:hover:bg-blue-950">
                <TableHead className="w-12 px-2 py-1 text-xs">
                  <input
                    type="checkbox"
                    checked={paginatedExpenses.length > 0 && selectedExpenses.size === paginatedExpenses.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead
                  className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => handleSort('type')}
                >
                  <div className="flex items-center gap-2">
                    Type
                    {sortBy === 'type' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="px-2 py-1 text-xs">Description</TableHead>
                <TableHead className="px-2 py-1 text-xs">Property</TableHead>
                <TableHead className="px-2 py-1 text-xs">Unit</TableHead>
                <TableHead
                  className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center gap-2">
                    Amount
                    {sortBy === 'amount' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="px-2 py-1 text-xs">Frequency</TableHead>
                <TableHead className="px-2 py-1 text-xs">Distribution</TableHead>
                <TableHead
                  className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
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
                  className="px-2 py-1 text-xs cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="px-2 py-1 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExpenses.map((expense: ExpenseWithDetails) => (
                <TableRow key={expense.id} className="hover:bg-orange-50 dark:hover:bg-orange-950/20">
                  <TableCell className="px-2 py-1">
                    <input
                      type="checkbox"
                      checked={selectedExpenses.has(expense.id)}
                      onChange={(e) => handleSelectExpense(expense.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <Badge variant="outline">
                      {getExpenseTypeLabel(expense.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs max-w-xs">
                    <div className="truncate" title={expense.description}>
                      {expense.description}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-32" title={getPropertyName(expense.propertyId)}>
                        {getPropertyName(expense.propertyId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    {getUnitInfo(expense.unitId) ? (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>{getUnitInfo(expense.unitId)?.number}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Property-wide</span>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs amount-cell font-bold text-primary">
                    ₹{expense.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <Badge variant="secondary">
                      {getFrequencyLabel(expense.frequency)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    <Badge variant="outline">
                      {getDistributionLabel(expense.distribution)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs">
                    {format(new Date(expense.startDate), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs status-cell">
                    {getStatusBadge(expense.status, expense.isActive)}
                  </TableCell>
                  <TableCell className="px-2 py-1 text-xs text-right actions-cell">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="View Details"
                        onClick={() => navigate(`/expenses/${expense.id}`)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title="Edit Expense"
                        onClick={() => navigate(`/expenses/${expense.id}/edit`)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete Expense"
                        onClick={() => handleDeleteClick(expense)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paginatedExpenses.length === 0 && (
            <div className="empty-state">
              <DollarSign className="empty-icon" />
              <h3 className="empty-title">No expenses found</h3>
              <p className="empty-description">
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-container">
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
          <DialogContent>
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
    </AppLayout>
  );
};

export default ExpenseListPageEnhanced;