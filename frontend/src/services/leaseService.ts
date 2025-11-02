import type { Lease, LeaseInput } from '../types/lease';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

class LeaseService {
  async getAll(unitId?: string, tenantId?: string): Promise<ApiResponse<{ leases: Lease[] }>> {
    const params: any = {};
    if (unitId) params.unitId = unitId;
    if (tenantId) params.tenantId = tenantId;
    return apiClient.get<{ leases: Lease[] }>(API_ENDPOINTS.LEASES, { params: Object.keys(params).length > 0 ? params : undefined });
  }

  async getById(id: string): Promise<ApiResponse<Lease>> {
    return apiClient.get<Lease>(`${API_ENDPOINTS.LEASES}/${id}`);
  }

  async create(data: LeaseInput): Promise<ApiResponse<Lease>> {
    return apiClient.post<Lease>(API_ENDPOINTS.LEASES, data);
  }

  async update(id: string, data: Partial<LeaseInput>): Promise<ApiResponse<Lease>> {
    return apiClient.put<Lease>(`${API_ENDPOINTS.LEASES}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.LEASES}/${id}`);
  }
}

export const leaseService = new LeaseService();
export default leaseService;
