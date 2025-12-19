import React from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Download, X } from 'lucide-react';
import { Card, CardHeader } from '@/componentDesignLibrary';
import { Button, Input, Badge } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import type { LeaseFiltersProps } from './LeaseFilters.types';

export const LeaseFilters: React.FC<LeaseFiltersProps> = ({
  search, onSearchChange,
  statusFilter, onStatusFilterChange,
  sortBy, sortOrder, onSortChange,
  itemsPerPage, onItemsPerPageChange,
  viewMode, onViewModeChange,
  showAdvancedFilters, onToggleAdvancedFilters,
  dateRange, onDateRangeChange,
  rentRange, onRentRangeChange,
  selectedUnit, onUnitChange,
  selectedTenant, onTenantChange,
  units, tenants,
  activeFilters, onRemoveFilter, onClearAllFilters
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'expired', label: 'Expired' },
    { value: 'draft', label: 'Draft' },
    { value: 'terminated', label: 'Terminated' },
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

  const unitOptions = [
    { value: 'all', label: 'All Units' },
    ...units.map(unit => ({ value: unit.id, label: unit.unitNumber }))
  ];

  const tenantOptions = [
    { value: 'all', label: 'All Tenants' },
    ...tenants.map(tenant => ({ value: tenant.id, label: `${tenant.firstName} ${tenant.lastName}` }))
  ];

  return (
    <Card className="filters-section">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="flex items-center gap-1">
                  {filter.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => onRemoveFilter(filter.key)}
                  />
                </Badge>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAllFilters}
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
                onChange={(e) => onSearchChange(e.target.value)} 
                className="pl-9"
              />
            </div>

            {/* Basic Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select 
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  onSortChange(field, order as 'asc' | 'desc');
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
                onValueChange={(value) => onItemsPerPageChange(Number(value))}
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

              {/* View Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('table')}
                  className="rounded-r-none"
                >
                  Table
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('timeline')}
                  className="rounded-l-none"
                >
                  Timeline
                </Button>
              </div>

              <Button 
                variant="outline" 
                size="sm"
                onClick={onToggleAdvancedFilters}
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
                      onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      type="date"
                      placeholder="End date"
                      value={dateRange.end || ''}
                      onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
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
                      onChange={(e) => onRentRangeChange({ ...rentRange, min: Number(e.target.value) || undefined })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={rentRange.max || ''}
                      onChange={(e) => onRentRangeChange({ ...rentRange, max: Number(e.target.value) || undefined })}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Unit Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Unit</label>
                  <Select value={selectedUnit} onValueChange={onUnitChange}>
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
                  <Select value={selectedTenant} onValueChange={onTenantChange}>
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
    </Card>
  );
};
