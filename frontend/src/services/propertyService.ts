import type { Property, PropertyInput, PropertyFilters } from '../types/property';
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
}

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;