import { apiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import type { ApiResponse } from '@/types/api';
import type { PropertyReceiptTemplate } from '@/types/property';

class ReceiptTemplateService {
  async getReceiptTemplate(propertyId: string): Promise<ApiResponse<PropertyReceiptTemplate>> {
    return apiClient.get<PropertyReceiptTemplate>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/receipt-template`);
  }

  async createReceiptTemplate(propertyId: string, templateData: Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PropertyReceiptTemplate>> {
    return apiClient.post<PropertyReceiptTemplate>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/receipt-template`, templateData);
  }

  async updateReceiptTemplate(propertyId: string, templateData: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<PropertyReceiptTemplate>> {
    return apiClient.put<PropertyReceiptTemplate>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/receipt-template`, templateData);
  }

  async deleteReceiptTemplate(propertyId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/receipt-template`);
  }
}

export const receiptTemplateService = new ReceiptTemplateService();
export default receiptTemplateService;
