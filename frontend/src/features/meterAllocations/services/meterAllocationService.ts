import { apiClient } from '@/lib/apiClient';
import type { MeterAllocation, MeterAllocationInput, MeterAllocationFilters } from '../types';
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

class MeterAllocationService {
  private readonly BASE = '/api/v1/meter-allocations';

  async getAll(options?: PaginationOptions, filters?: MeterAllocationFilters): Promise<ApiResponse<PaginationResult<MeterAllocation>>> {
    let url = this.BASE;
    
    // Backend returns array, so we paginate client-side
    const res = await apiClient.get<MeterAllocation[]>(url);

    if (!res.success) {
      return res as any;
    }

    let arr = res.data || [];

    // Client-side filtering
    if (filters) {
      if (filters.meterId) arr = arr.filter(m => m.meterId === filters.meterId);
      if (filters.subscriptionId) arr = arr.filter(m => m.subscriptionId === filters.subscriptionId);
    }
    
    const page = options?.page ?? 1;
    const limit = options?.limit ?? (arr.length || 10);
    const total = arr.length;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = arr.slice(startIndex, endIndex);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    
    const pagination: PaginationResult<MeterAllocation> = {
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

  async getById(id: string): Promise<ApiResponse<MeterAllocation>> {
    return apiClient.get<MeterAllocation>(`${this.BASE}/${id}`);
  }

  async create(data: MeterAllocationInput): Promise<ApiResponse<MeterAllocation>> {
    return apiClient.post<MeterAllocation>(this.BASE, data);
  }

  async update(id: string, data: Partial<MeterAllocationInput>): Promise<ApiResponse<MeterAllocation>> {
    return apiClient.put<MeterAllocation>(`${this.BASE}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE}/${id}`);
  }
}

export const meterAllocationService = new MeterAllocationService();
