import type { Property, PropertyInput, PropertyFilters } from '@/types/property';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/constants/api';
import { createComponentLogger } from '@/utils/logger';

const logger = createComponentLogger('PropertyService');

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
    logger.debug('Updating property', { propertyId: id, fields: Object.keys(propertyData) });
    const startTime = Date.now();
    try {
      const result = await apiClient.put<Property>(`${API_ENDPOINTS.PROPERTIES}/${id}`, propertyData);
      const duration = Date.now() - startTime;
      logger.info('Property updated successfully', { propertyId: id, duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to update property', error, { propertyId: id, duration: `${duration}ms` });
      throw error;
    }
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
