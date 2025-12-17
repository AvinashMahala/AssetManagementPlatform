import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Filter, Search } from 'lucide-react';
import type { FileFiltersProps } from './FileFilters.types';
import './FileFilters.scss';

export const FileFilters: React.FC<FileFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    onFilterChange(key, value);
  };

  return (
    <Card className="filters-section">
      <CardHeader className="filters-header pb-2 pt-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="filters-content px-4 pb-3 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          <div className="search-container">
            <Search className="search-icon h-3.5 w-3.5" />
            <Input
              placeholder="Search files..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input h-9 text-sm"
            />
          </div>

          <Select
            value={filters.entityType || ''}
            onValueChange={(value) => handleFilterChange('entityType', value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-900 border shadow-lg">
              <SelectItem value="property">Property</SelectItem>
              <SelectItem value="unit">Unit</SelectItem>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.category || ''}
            onValueChange={(value) => handleFilterChange('category', value)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photo">Photo</SelectItem>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={onClearFilters}
              className="w-full h-9 text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};