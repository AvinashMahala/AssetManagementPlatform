// Asset-related type definitions
export interface Asset {
  id: number;
  name: string;
  description?: string;
  value: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetInput {
  name: string;
  description?: string;
  value: number;
  location?: string;
}

export interface AssetFormData extends AssetInput {
  // Additional form-specific fields can be added here
}

export interface AssetFilters {
  search?: string;
  location?: string;
  minValue?: number;
  maxValue?: number;
  sortBy?: 'name' | 'value' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AssetListResponse {
  data: Asset[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}