import type { Meter, MeterInput, MeterReading, MeterReadingInput } from '@/features/meters/types';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/apiClient';

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

class MeterService {
  /**
   * Get all meters with optional filtering and pagination
   */
  async getAll(options?: PaginationOptions, filters?: MeterFilters): Promise<ApiResponse<PaginationResult<Meter>>> {
    let url = '/api/v1/meters';
    const params = new URLSearchParams();

    if (options) {
      params.append('page', options.page.toString());
      params.append('limit', options.limit.toString());
    }

    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.meterType) params.append('meterType', filters.meterType);
      if (filters.status) params.append('status', filters.status);
      if (filters.propertyId) params.append('propertyId', filters.propertyId);
      if (filters.unitId) params.append('unitId', filters.unitId);
    }

    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<PaginationResult<Meter>>(url);
  }

  /**
   * Get meter by ID
   */
  async getById(id: string): Promise<ApiResponse<Meter>> {
    return apiClient.get<Meter>(`/api/meters/${id}`);
  }

  /**
   * Create new meter
   */
  async create(data: MeterInput): Promise<ApiResponse<Meter>> {
    return apiClient.post<Meter>('/api/v1/meters', data);
  }

  /**
   * Update meter
   */
  async update(id: string, data: Partial<MeterInput>): Promise<ApiResponse<Meter>> {
    return apiClient.put<Meter>(`/api/meters/${id}`, data);
  }

  /**
   * Delete meter
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/meters/${id}`);
  }

  /**
   * Update meter status
   */
  async updateStatus(id: string, isActive: boolean): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/api/meters/${id}/status`, { isActive });
  }

  /**
   * Get meter readings for a meter
   */
  async getMeterReadings(meterId: string, startDate?: string, endDate?: string): Promise<ApiResponse<{ readings: MeterReading[] }>> {
    let url = `/api/meters/${meterId}/readings`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<{ readings: MeterReading[] }>(url);
  }

  /**
   * Get latest meter reading
   */
  async getLatestReading(meterId: string): Promise<ApiResponse<MeterReading>> {
    return apiClient.get<MeterReading>(`/api/meters/${meterId}/readings/latest`);
  }

  /**
   * Create meter reading
   */
  async createReading(meterId: string, data: Omit<MeterReadingInput, 'meterId'>): Promise<ApiResponse<MeterReading>> {
    return apiClient.post<MeterReading>(`/api/meters/${meterId}/readings`, data);
  }

  /**
   * Update meter reading
   */
  async updateReading(id: string, data: Partial<MeterReadingInput>): Promise<ApiResponse<MeterReading>> {
    return apiClient.put<MeterReading>(`/api/meters/readings/${id}`, data);
  }

  /**
   * Delete meter reading
   */
  async deleteReading(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/meters/readings/${id}`);
  }

  /**
   * Get meter trend data
   */
  async getTrendData(meterId: string, months: number = 6): Promise<ApiResponse<{ trend: any[] }>> {
    return apiClient.get<{ trend: any[] }>(`/api/meters/${meterId}/trend?months=${months}`);
  }

  /**
   * Get meter statistics
   */
  async getStatistics(meterId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/meters/${meterId}/statistics`);
  }
}

export const meterService = new MeterService();
export default meterService;