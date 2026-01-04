import { apiClient } from '@/lib/apiClient';
import type { Tariff, TariffInput, TariffFilters } from '../types';
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

class TariffService {
  private readonly BASE = '/api/v1/tariffs';

  async getAll(options?: PaginationOptions, filters?: TariffFilters): Promise<ApiResponse<PaginationResult<Tariff>>> {
    let url = this.BASE;
    
    // Backend returns array, so we paginate client-side
    const res = await apiClient.get<Tariff[]>(url);

    if (!res.success) {
      return res as any;
    }

    let arr = res.data || [];

    // Client-side filtering
    if (filters) {
      if (filters.utilityTypeId) arr = arr.filter(t => t.utilityTypeId === filters.utilityTypeId);
      if (filters.subscriptionId) arr = arr.filter(t => t.subscriptionId === filters.subscriptionId);
      if (filters.meterId) arr = arr.filter(t => t.meterId === filters.meterId);
    }
    
    const page = options?.page ?? 1;
    const limit = options?.limit ?? (arr.length || 10);
    const total = arr.length;
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = arr.slice(startIndex, endIndex);

    const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
    
    const pagination: PaginationResult<Tariff> = {
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

  async getById(id: string): Promise<ApiResponse<Tariff>> {
    return apiClient.get<Tariff>(`${this.BASE}/${id}`);
  }

  async create(data: TariffInput): Promise<ApiResponse<Tariff>> {
    return apiClient.post<Tariff>(this.BASE, data);
  }

  async update(id: string, data: Partial<TariffInput>): Promise<ApiResponse<Tariff>> {
    return apiClient.put<Tariff>(`${this.BASE}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE}/${id}`);
  }

  async getApplicable(utilityTypeId: string, date: string, subscriptionId?: string, meterId?: string): Promise<ApiResponse<Tariff>> {
    const params = new URLSearchParams();
    params.append('utilityTypeId', utilityTypeId);
    params.append('date', date);
    if (subscriptionId) params.append('subscriptionId', subscriptionId);
    if (meterId) params.append('meterId', meterId);

    return apiClient.get<Tariff>(`${this.BASE}/applicable?${params.toString()}`);
  }
}

export const tariffService = new TariffService();
