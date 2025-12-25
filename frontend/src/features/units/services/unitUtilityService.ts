import type { UnitUtility, UnitUtilityInput } from '@/features/units/types';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/apiClient';

class UnitUtilityService {
  async getAll(unitId?: string, propertyId?: string): Promise<ApiResponse<UnitUtility[]>> {
    let url = '/api/v1/unit-utilities';
    const params = new URLSearchParams();

    if (unitId) params.append('unitId', unitId);
    if (propertyId) params.append('propertyId', propertyId);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return apiClient.get<UnitUtility[]>(url);
  }

  async getById(id: string): Promise<ApiResponse<UnitUtility>> {
    return apiClient.get<UnitUtility>(`/api/unit-utilities/${id}`);
  }

  async create(data: UnitUtilityInput): Promise<ApiResponse<UnitUtility>> {
    return apiClient.post<UnitUtility>('/api/v1/unit-utilities', data);
  }

  async update(id: string, data: Partial<UnitUtilityInput>): Promise<ApiResponse<UnitUtility>> {
    return apiClient.put<UnitUtility>(`/api/unit-utilities/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/unit-utilities/${id}`);
  }

  async toggleStatus(id: string, isEnabled: boolean): Promise<ApiResponse<void>> {
    return apiClient.patch<void>(`/api/unit-utilities/${id}/toggle`, { isEnabled });
  }

  async calculateCharges(unitId: string, startDate: string, endDate: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    return apiClient.get<any>(`/api/unit-utilities/unit/${unitId}/charges?${params.toString()}`);
  }

  async getSummary(unitId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/api/unit-utilities/unit/${unitId}/summary`);
  }

  async validateConfiguration(unitId: string): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    return apiClient.get<{ isValid: boolean; errors: string[] }>(`/api/unit-utilities/unit/${unitId}/validate`);
  }
}

export const unitUtilityService = new UnitUtilityService();
export default unitUtilityService;