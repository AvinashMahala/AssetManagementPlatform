import type { RentPayment, RentPaymentInput } from '@/features/finance/types';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/constants/api';

class PaymentService {
  async getAll(leaseId?: string, tenantId?: string): Promise<ApiResponse<RentPayment[]>> {
    let url = API_ENDPOINTS.RENT_PAYMENTS;
    const params = new URLSearchParams();
    if (leaseId) params.append('leaseId', leaseId);
    if (tenantId) params.append('tenantId', tenantId);
    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<RentPayment[]>(url);
  }

  async getById(id: string): Promise<ApiResponse<RentPayment>> {
    return apiClient.get<RentPayment>(`${API_ENDPOINTS.RENT_PAYMENTS}/${id}`);
  }

  async create(data: RentPaymentInput): Promise<ApiResponse<RentPayment>> {
    return apiClient.post<RentPayment>(API_ENDPOINTS.RENT_PAYMENTS, data);
  }

  async update(id: string, data: Partial<RentPaymentInput>): Promise<ApiResponse<RentPayment>> {
    return apiClient.put<RentPayment>(`${API_ENDPOINTS.RENT_PAYMENTS}/${id}`, data);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.RENT_PAYMENTS}/${id}`);
  }

  async deleteBulk(ids: string[]): Promise<ApiResponse<{ deleted: number; failed: string[] }>> {
    return apiClient.delete<{ deleted: number; failed: string[] }>(`${API_ENDPOINTS.RENT_PAYMENTS}/bulk-delete`, { data: { ids } });
  }
}

export const paymentService = new PaymentService();
export default paymentService;
