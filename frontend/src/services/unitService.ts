import type { Unit, UnitInput } from '../types/unit';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

class UnitService {
  async getAll(propertyId?: string): Promise<ApiResponse<Unit[]>> {
    const url = propertyId 
      ? `${API_ENDPOINTS.UNITS}?propertyId=${propertyId}` 
      : API_ENDPOINTS.UNITS;
    return apiClient.get<Unit[]>(url);
  }

  async getById(id: string): Promise<ApiResponse<Unit>> {
    return apiClient.get<Unit>(`${API_ENDPOINTS.UNITS}/${id}`);
  }

  async create(data: UnitInput): Promise<ApiResponse<Unit>> {
    return apiClient.post<Unit>(API_ENDPOINTS.UNITS, data);
  }

  async update(id: string, data: Partial<UnitInput>): Promise<ApiResponse<Unit>> {
    return apiClient.put<Unit>(`${API_ENDPOINTS.UNITS}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.UNITS}/${id}`);
  }
}

export const unitService = new UnitService();
export default unitService;
