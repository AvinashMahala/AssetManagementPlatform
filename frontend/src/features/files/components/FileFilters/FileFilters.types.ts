export interface FileFilters {
  entityType?: string;
  category?: string;
  search?: string;
}

export interface FileFiltersProps {
  filters: FileFilters;
  onFilterChange: (key: keyof FileFilters, value: string) => void;
  onClearFilters: () => void;
}