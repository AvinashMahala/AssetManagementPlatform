import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';
import type { ApiResponse } from '../types/api';
import type { PropertyFile } from '../types/property';

class PropertyFileService {
  async getPropertyFiles(propertyId: string): Promise<ApiResponse<PropertyFile[]>> {
    return apiClient.get<PropertyFile[]>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/files`);
  }

  async uploadPropertyFile(propertyId: string, file: File, fileType: 'photo' | 'document', description?: string): Promise<ApiResponse<PropertyFile>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    if (description) {
      formData.append('description', description);
    }

    return apiClient.post<PropertyFile>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/files`, formData);
  }

  async updatePropertyFile(propertyId: string, fileId: string, updates: Partial<PropertyFile>): Promise<ApiResponse<PropertyFile>> {
    return apiClient.put<PropertyFile>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/files/${fileId}`, updates);
  }

  async deletePropertyFile(propertyId: string, fileId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/files/${fileId}`);
  }
}

export const propertyFileService = new PropertyFileService();
export default propertyFileService;
