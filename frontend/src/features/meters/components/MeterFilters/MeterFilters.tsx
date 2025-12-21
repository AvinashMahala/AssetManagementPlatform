import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/componentDesignLibrary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/componentDesignLibrary';
import styles from './MeterFilters.module.scss';

interface MeterFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  meterType: string;
  onMeterTypeChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  limit: number;
  onLimitChange: (value: number) => void;
}

export const MeterFilters: React.FC<MeterFiltersProps> = ({
  searchTerm,
  onSearchChange,
  meterType,
  onMeterTypeChange,
  status,
  onStatusChange,
  limit,
  onLimitChange,
}) => {
  return (
    <div
      data-section="filters"
      className={`${styles['filters-section']} flex flex-col sm:flex-row gap-2`}
    >
      <div className="relative flex-1">
        <Search className="search-icon absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className={`${styles['search-input']} pl-10`}
          placeholder="Search meters by name or number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles['filter-select']}>
        <Select
          value={meterType || 'all'}
          onValueChange={onMeterTypeChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="electricity">Electricity</SelectItem>
            <SelectItem value="water">Water</SelectItem>
            <SelectItem value="gas">Gas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles['filter-select']}>
        <Select
          value={status || 'all'}
          onValueChange={onStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={styles['filter-select']}>
        <Select
          value={limit.toString()}
          onValueChange={(value) => onLimitChange(parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per page</SelectItem>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="20">20 per page</SelectItem>
            <SelectItem value="50">50 per page</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
