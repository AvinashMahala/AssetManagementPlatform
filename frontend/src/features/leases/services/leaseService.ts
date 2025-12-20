import type { Lease, LeaseInput } from '../types/lease';
import type { ApiResponse } from '../../../types/api';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '../../../constants/api';

class LeaseService {
  async getAll(unitId?: string, tenantId?: string): Promise<ApiResponse<Lease[]>> {
    let url = API_ENDPOINTS.LEASES;
    const params = new URLSearchParams();
    if (unitId) params.append('unitId', unitId);
    if (tenantId) params.append('tenantId', tenantId);
    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<Lease[]>(url);
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
