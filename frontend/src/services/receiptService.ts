import type {
  Receipt,
  ReceiptGenerationRequest,
  BulkReceiptGenerationRequest,
  ReceiptData
} from '../types/receipt';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

class ReceiptService {
  async getAll(): Promise<ApiResponse<Receipt[]>> {
    return apiClient.get<Receipt[]>(API_ENDPOINTS.RECEIPTS);
  }

  async getById(id: string): Promise<ApiResponse<Receipt>> {
    return apiClient.get<Receipt>(`${API_ENDPOINTS.RECEIPTS}/${id}`);
  }

  async getByReceiptNumber(receiptNumber: string): Promise<ApiResponse<Receipt>> {
    return apiClient.get<Receipt>(`${API_ENDPOINTS.RECEIPTS}/number/${receiptNumber}`);
  }

  async getByProperty(propertyId: string): Promise<ApiResponse<Receipt[]>> {
    return apiClient.get<Receipt[]>(`${API_ENDPOINTS.RECEIPTS}/property/${propertyId}`);
  }

  async getByTenant(tenantId: string): Promise<ApiResponse<Receipt[]>> {
    return apiClient.get<Receipt[]>(`${API_ENDPOINTS.RECEIPTS}/tenant/${tenantId}`);
  }

  async generateReceipt(data: ReceiptGenerationRequest): Promise<ApiResponse<Receipt>> {
    return apiClient.post<Receipt>(`${API_ENDPOINTS.RECEIPTS}/generate`, data);
  }

  async generateBulkReceipts(data: BulkReceiptGenerationRequest): Promise<ApiResponse<Receipt[]>> {
    return apiClient.post<Receipt[]>(`${API_ENDPOINTS.RECEIPTS}/generate-bulk`, data);
  }

  async updateReceipt(id: string, data: Partial<Receipt>): Promise<ApiResponse<Receipt>> {
    return apiClient.put<Receipt>(`${API_ENDPOINTS.RECEIPTS}/${id}`, data);
  }

  async deleteReceipt(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.RECEIPTS}/${id}`);
  }

  async sendReceiptByEmail(id: string, email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${API_ENDPOINTS.RECEIPTS}/${id}/send-email`, { email });
  }

  async downloadReceiptPDF(id: string): Promise<Blob> {
    const response = await apiClient.download(`${API_ENDPOINTS.RECEIPTS}/${id}/download`);
    return response.blob();
  }

  async getPropertyReceiptSettings(propertyId: string): Promise<ApiResponse<ReceiptData['settings']>> {
    return apiClient.get<ReceiptData['settings']>(`${API_ENDPOINTS.RECEIPTS}/settings/property/${propertyId}`);
  }

  async updatePropertyReceiptSettings(propertyId: string, settings: ReceiptData['settings']): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${API_ENDPOINTS.RECEIPTS}/settings/property/${propertyId}`, settings);
  }
}

export const receiptService = new ReceiptService();
export default receiptService;