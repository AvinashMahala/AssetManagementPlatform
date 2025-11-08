import type { Meter, MeterInput, MeterReading, MeterReadingInput } from '../types/meter';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';

class MeterService {
  /**
   * Get all meters with optional filtering
   */
  async getAll(propertyId?: string, unitId?: string): Promise<ApiResponse<Meter[]>> {
    let url = '/api/meters';
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (unitId) params.append('unitId', unitId);
    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<Meter[]>(url);
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
    return apiClient.post<Meter>('/api/meters', data);
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