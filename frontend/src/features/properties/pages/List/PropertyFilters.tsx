import React from 'react';
import { Search, Grid3x3, List } from 'lucide-react';
import { Input } from '@/componentDesignLibrary';
import { Button } from '@/componentDesignLibrary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/componentDesignLibrary';
import { PropertyType, PropertyStatus } from '@/features/properties/types';

interface PropertyFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  itemsPerPage,
  onItemsPerPageChange,
  viewMode,
  onViewModeChange,
}) => {
  const itemsPerPageOptions = [
    { value: 10, label: '10 per page' },
    { value: 25, label: '25 per page' },
    { value: 50, label: '50 per page' },
    { value: 100, label: '100 per page' },
  ];

  return (
    <div className="filters-section flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="search-icon absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="search-input pl-9 h-9 text-sm"
          placeholder="Search properties by name or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={(value) => {
          onStatusFilterChange(value);
        }}
      >
        <SelectTrigger className="filter-select h-9 w-[140px] text-sm">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent className="filter-dropdown">
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value={PropertyStatus.AVAILABLE}>Available</SelectItem>
          <SelectItem value={PropertyStatus.OCCUPIED}>Occupied</SelectItem>
          <SelectItem value={PropertyStatus.UNDER_MAINTENANCE}>Maintenance</SelectItem>
          <SelectItem value={PropertyStatus.VACANT}>Vacant</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={typeFilter}
        onValueChange={(value) => {
          onTypeFilterChange(value);
        }}
      >
        <SelectTrigger className="filter-select h-9 w-[140px] text-sm">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="filter-dropdown">
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value={PropertyType.APARTMENT}>Apartment</SelectItem>
          <SelectItem value={PropertyType.HOUSE}>House</SelectItem>
          <SelectItem value={PropertyType.VILLA}>Villa</SelectItem>
          <SelectItem value={PropertyType.COMMERCIAL}>Commercial</SelectItem>
          <SelectItem value={PropertyType.PG_HOSTEL}>PG/Hostel</SelectItem>
          <SelectItem value={PropertyType.CO_LIVING}>Co-Living</SelectItem>
          <SelectItem value={PropertyType.OFFICE}>Office</SelectItem>
          <SelectItem value={PropertyType.SHOP}>Shop</SelectItem>
          <SelectItem value={PropertyType.WAREHOUSE}>Warehouse</SelectItem>
        </SelectContent>
      </Select>
      {/* Items per page */}
      <Select
        value={itemsPerPage.toString()}
        onValueChange={(value) => {
          onItemsPerPageChange(Number(value));
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
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          className="toggle-button h-9 w-9 p-0"
          onClick={() => onViewModeChange('grid')}
          title="Grid View"
        >
          <Grid3x3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          className="toggle-button h-9 w-9 p-0"
          onClick={() => onViewModeChange('table')}
          title="Table View"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PropertyFilters;