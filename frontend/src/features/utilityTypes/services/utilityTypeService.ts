import { apiClient } from '@/lib/apiClient';
import type { UtilityType, UtilityTypeInput, UtilityTypeFilters } from '../types';
import type { ApiResponse } from '@/types/api';

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

class UtilityTypeService {
  private readonly BASE = '/api/v1/utility-types';

  /**
   * Get all utility types with optional filtering and pagination
   */
  async getAll(options?: PaginationOptions, filters?: UtilityTypeFilters): Promise<ApiResponse<PaginationResult<UtilityType>>> {
    let url = this.BASE;
    const params = new URLSearchParams();

    if (options) {
      params.append('page', options.page.toString());
      params.append('limit', options.limit.toString());
    }

    if (filters) {
      if (filters.search) params.append('search', filters.search);
    }

    if (params.toString()) url += `?${params.toString()}`;

    // Backend may return either a paginated object or a raw array.
    const res = await apiClient.get<UtilityType[] | PaginationResult<UtilityType>>(url);

    if (!res.success) {
      return res as any;
    }

    // If backend returned an array, normalize into PaginationResult
    if (Array.isArray(res.data)) {
      let arr = res.data as UtilityType[];
      
      // Client-side filtering if backend doesn't support it
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        arr = arr.filter(u => 
          u.name.toLowerCase().includes(searchLower) || 
          u.key.toLowerCase().includes(searchLower)
        );
      }

      const page = options?.page ?? 1;
      const limit = options?.limit ?? (arr.length || 10);
      const total = arr.length;
      
      // Client-side pagination if backend returned full list
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = arr.slice(startIndex, endIndex);

      const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
      
      const pagination: PaginationResult<UtilityType> = {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
      return {
        success: true,
        data: pagination,
        message: res.message,
        requestId: res.requestId,
      };
    }

    // Already a PaginationResult
    return {
      success: true,
      data: res.data as PaginationResult<UtilityType>,
      message: res.message,
      requestId: res.requestId,
    };
  }

  async getById(id: string): Promise<ApiResponse<UtilityType>> {
    return apiClient.get<UtilityType>(`${this.BASE}/${id}`);
  }

  async create(data: UtilityTypeInput): Promise<ApiResponse<UtilityType>> {
    return apiClient.post<UtilityType>(this.BASE, data);
  }

  async update(id: string, data: Partial<UtilityTypeInput>): Promise<ApiResponse<UtilityType>> {
    return apiClient.put<UtilityType>(`${this.BASE}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE}/${id}`);
  }
}

export const utilityTypeService = new UtilityTypeService();
