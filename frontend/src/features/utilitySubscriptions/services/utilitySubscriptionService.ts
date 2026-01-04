import { apiClient } from '@/lib/apiClient';
import type { UtilitySubscription, UtilitySubscriptionInput, UtilitySubscriptionFilters } from '../types';
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

class UtilitySubscriptionService {
  private readonly BASE = '/api/v1/utility-subscriptions';

  async getAll(options?: PaginationOptions, filters?: UtilitySubscriptionFilters): Promise<ApiResponse<PaginationResult<UtilitySubscription>>> {
    let url = this.BASE;
    const params = new URLSearchParams();

    if (filters?.unitId) {
      url = `${this.BASE}/unit/${filters.unitId}`;
    }

    // Backend returns array, so we paginate client-side
    const res = await apiClient.get<UtilitySubscription[]>(url);

    if (!res.success) {
      return res as any;
    }

    let arr = res.data || [];
    
    const page = options?.page ?? 1;
    const limit = options?.limit ?? (arr.length || 10);
    const total = arr.length;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = arr.slice(startIndex, endIndex);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    
    const pagination: PaginationResult<UtilitySubscription> = {
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

  async getById(id: string): Promise<ApiResponse<UtilitySubscription>> {
    return apiClient.get<UtilitySubscription>(`${this.BASE}/${id}`);
  }

  async create(data: UtilitySubscriptionInput): Promise<ApiResponse<UtilitySubscription>> {
    return apiClient.post<UtilitySubscription>(this.BASE, data);
  }

  async update(id: string, data: Partial<UtilitySubscriptionInput>): Promise<ApiResponse<UtilitySubscription>> {
    return apiClient.put<UtilitySubscription>(`${this.BASE}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE}/${id}`);
  }
}

export const utilitySubscriptionService = new UtilitySubscriptionService();
