import type { Property, PropertyInput, PropertyListResponse, PropertyFilters } from '../types/property';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS, PAGINATION_DEFAULTS } from '../constants/api';

class PropertyService {
  async getAll(filters?: PropertyFilters): Promise<ApiResponse<PropertyListResponse>> {
    const params = {
      page: filters?.page || PAGINATION_DEFAULTS.PAGE,
      limit: filters?.limit || PAGINATION_DEFAULTS.LIMIT,
      search: filters?.search,
      propertyType: filters?.propertyType,
      status: filters?.status,
      city: filters?.city,
      state: filters?.state,
      minArea: filters?.minArea,
      maxArea: filters?.maxArea,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
    };

    return apiClient.get<PropertyListResponse>(API_ENDPOINTS.PROPERTIES, { params });
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
  async search(query: string): Promise<ApiResponse<PropertyListResponse>> {
    return this.getAll({ search: query });
  }

  async getByType(propertyType: string): Promise<ApiResponse<PropertyListResponse>> {
    return this.getAll({ propertyType: propertyType as any });
  }

  async getByStatus(status: string): Promise<ApiResponse<PropertyListResponse>> {
    return this.getAll({ status: status as any });
  }

  async getByCity(city: string): Promise<ApiResponse<PropertyListResponse>> {
    return this.getAll({ city });
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
export default propertyService;