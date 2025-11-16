export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface MeterFilters {
  search?: string;
  meterType?: string;
  status?: 'active' | 'inactive';
  propertyId?: string;
  unitId?: string;
}