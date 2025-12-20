import type { Unit } from '@/features/units/types';
import type { Tenant } from '@/features/tenants/types';

export interface LeaseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  viewMode: 'table' | 'timeline';
  onViewModeChange: (value: 'table' | 'timeline') => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  dateRange: { start?: string; end?: string };
  onDateRangeChange: (range: { start?: string; end?: string }) => void;
  rentRange: { min?: number; max?: number };
  onRentRangeChange: (range: { min?: number; max?: number }) => void;
  selectedUnit: string;
  onUnitChange: (value: string) => void;
  selectedTenant: string;
  onTenantChange: (value: string) => void;
  units: Unit[];
  tenants: Tenant[];
  activeFilters: { key: string; label: string; value: any }[];
  onRemoveFilter: (key: string) => void;
  onClearAllFilters: () => void;
}
