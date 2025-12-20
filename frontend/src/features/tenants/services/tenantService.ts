import type { Tenant, TenantInput } from '@/types/tenant';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants/api';

class TenantService {
  async getAll(): Promise<ApiResponse<Tenant[]>> {
    return apiClient.get<Tenant[]>(API_ENDPOINTS.TENANTS);
  }

  async getById(id: string): Promise<ApiResponse<Tenant>> {
    return apiClient.get<Tenant>(`${API_ENDPOINTS.TENANTS}/${id}`);
  }

  async create(data: TenantInput): Promise<ApiResponse<Tenant>> {
    return apiClient.post<Tenant>(API_ENDPOINTS.TENANTS, data);
  }

  async update(id: string, data: Partial<TenantInput>): Promise<ApiResponse<Tenant>> {
    return apiClient.put<Tenant>(`${API_ENDPOINTS.TENANTS}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.TENANTS}/${id}`);
  }
}

export const tenantService = new TenantService();
export default tenantService;
