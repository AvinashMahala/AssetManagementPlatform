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

    // Backend may return either a paginated object or a raw array of meters.
    const res = await apiClient.get<Meter[] | PaginationResult<Meter>>(url);

    if (!res.success) {
      return res as any;
    }

    // If backend returned an array, normalize into PaginationResult
    if (Array.isArray(res.data)) {
      const arr = res.data as Meter[];
      const page = options?.page ?? 1;
      const limit = options?.limit ?? (arr.length || 10);
      const total = arr.length;
      const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
      const pagination: PaginationResult<Meter> = {
        data: arr,
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
      data: res.data as PaginationResult<Meter>,
      message: res.message,
      requestId: res.requestId,
    };
  }

  private readonly BASE = '/api/v1/meters';
  private readonly READING_BASE = '/api/v1/meterreadings';

  /**
   * Get meter by ID
   */
  async getById(id: string): Promise<ApiResponse<Meter>> {
    return apiClient.get<Meter>(`${this.BASE}/${id}`);
  }

  /**
   * Create new meter
   */
  async create(data: MeterInput): Promise<ApiResponse<Meter>> {
    return apiClient.post<Meter>(`${this.BASE}`, data);
  }

  /**
   * Update meter
   */
  async update(id: string, data: Partial<MeterInput>): Promise<ApiResponse<Meter>> {
    return apiClient.put<Meter>(`${this.BASE}/${id}`, data);
  }

  /**
   * Delete meter
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.BASE}/${id}`);
  }

  /**
   * Update meter status
   */
  async updateStatus(id: string, isActive: boolean): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`${this.BASE}/${id}/status`, { isActive });
  }

  /**
   * Get meter readings for a meter
   */
  async getMeterReadings(meterId: string, startDate?: string, endDate?: string): Promise<ApiResponse<{ readings: MeterReading[] }>> {
    let url = `${this.READING_BASE}/meter/${meterId}`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<{ readings: MeterReading[] }>(url);
  }

  /**
   * Get latest meter reading (fetches readings and returns the most recent one)
   */
  async getLatestReading(meterId: string): Promise<ApiResponse<MeterReading>> {
    const res = await this.getMeterReadings(meterId);
    if (!res.success) return { success: false, message: res.message, requestId: res.requestId } as ApiResponse<MeterReading>;
    const readings = res.data?.readings ?? [];
    if (readings.length === 0) return { success: false, message: 'No readings found', requestId: res.requestId } as ApiResponse<MeterReading>;
    const latest = readings.reduce((a, b) => new Date(a.readingDate) > new Date(b.readingDate) ? a : b);
    return { success: true, data: latest, message: res.message, requestId: res.requestId };
  }

  /**
   * Create meter reading
   */
  async createReading(meterId: string, data: Omit<MeterReadingInput, 'meterId'>): Promise<ApiResponse<MeterReading>> {
    // backend expects POST /api/v1/meterreadings with meterId in body
    const payload = { meterId, ...data } as MeterReadingInput;
    return apiClient.post<MeterReading>(`${this.READING_BASE}`, payload);
  }

  /**
   * Update meter reading
   */
  async updateReading(id: string, data: Partial<MeterReadingInput>): Promise<ApiResponse<MeterReading>> {
    return apiClient.put<MeterReading>(`${this.READING_BASE}/${id}`, data);
  }

  /**
   * Delete meter reading
   */
  async deleteReading(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.READING_BASE}/${id}`);
  }

  /**
   * Get meter trend data
   */
  async getTrendData(meterId: string, months: number = 6): Promise<ApiResponse<{ trend: any[] }>> {
    return apiClient.get<{ trend: any[] }>(`${this.BASE}/${meterId}/trend?months=${months}`);
  }

  /**
   * Get meter statistics
   */
  async getStatistics(meterId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${this.BASE}/${meterId}/statistics`);
  }
}

export const meterService = new MeterService();
export default meterService;