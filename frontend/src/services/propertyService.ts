import type { Property, PropertyInput, PropertyFilters, PropertyFile, PropertyReceiptTemplate } from '../types/property';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

class PropertyService {
  async getAll(filters?: PropertyFilters): Promise<ApiResponse<Property[]>> {
    const params = {
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
    };

    return apiClient.get<Property[]>(API_ENDPOINTS.PROPERTIES, { params });
  }

  async getById(id: string): Promise<ApiResponse<Property>> {
    return apiClient.get<Property>(`${API_ENDPOINTS.PROPERTIES}/${id}`);
  }

  async create(propertyData: PropertyInput): Promise<ApiResponse<Property>> {
    return apiClient.post<Property>(API_ENDPOINTS.PROPERTIES, propertyData);
  }

  async update(id: string, propertyData: Partial<PropertyInput>): Promise<ApiResponse<Property>> {
    return apiClient.put<Property>(`${API_ENDPOINTS.PROPERTIES}/${id}`, propertyData);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PROPERTIES}/${id}`);
  }

  async updateStatus(id: string, status: string): Promise<ApiResponse<Property>> {
    return apiClient.patch<Property>(`${API_ENDPOINTS.PROPERTIES}/${id}/status`, { status });
  }

  // Utility methods
  async search(query: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ search: query });
  }

  async getByType(propertyType: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ propertyType: propertyType as any });
  }

  async getByStatus(status: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ status: status as any });
  }

  async getByCity(city: string): Promise<ApiResponse<Property[]>> {
    return this.getAll({ city });
  }

  // Property Files API
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

    return apiClient.post<PropertyFile>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async updatePropertyFile(propertyId: string, fileId: string, updates: Partial<PropertyFile>): Promise<ApiResponse<PropertyFile>> {
    return apiClient.put<PropertyFile>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/files/${fileId}`, updates);
  }

  async deletePropertyFile(propertyId: string, fileId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PROPERTIES}/${propertyId}/files/${fileId}`);
  }

  // Property Receipt Template API
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

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;