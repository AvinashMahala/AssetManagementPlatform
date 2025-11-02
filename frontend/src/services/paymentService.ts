import type { RentPayment, RentPaymentInput } from '../types/payment';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

class PaymentService {
  async getAll(leaseId?: string, tenantId?: string): Promise<ApiResponse<{ payments: RentPayment[] }>> {
    const params: any = {};
    if (leaseId) params.leaseId = leaseId;
    if (tenantId) params.tenantId = tenantId;
    return apiClient.get<{ payments: RentPayment[] }>(API_ENDPOINTS.RENT_PAYMENTS, { params: Object.keys(params).length > 0 ? params : undefined });
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
}

export const paymentService = new PaymentService();
export default paymentService;
