import type { Asset, AssetInput, AssetFilters } from '@/features/assets/types/asset';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/constants/api';

class AssetService {
  async getAll(filters?: AssetFilters): Promise<ApiResponse<Asset[]>> {
    const params = {
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
    };

    return apiClient.get<Asset[]>(API_ENDPOINTS.ASSETS, { params });
  }

  async getById(id: number): Promise<ApiResponse<Asset>> {
    return apiClient.get<Asset>(`${API_ENDPOINTS.ASSETS}/${id}`);
  }

  async create(assetData: AssetInput): Promise<ApiResponse<Asset>> {
    return apiClient.post<Asset>(API_ENDPOINTS.ASSETS, assetData);
  }

  async update(id: number, assetData: Partial<AssetInput>): Promise<ApiResponse<Asset>> {
    return apiClient.put<Asset>(`${API_ENDPOINTS.ASSETS}/${id}`, assetData);
  }

  async delete(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.ASSETS}/${id}`);
  }

  // Utility methods
  async search(query: string): Promise<ApiResponse<Asset[]>> {
    return this.getAll({ search: query });
  }

  async getByLocation(location: string): Promise<ApiResponse<Asset[]>> {
    return this.getAll({ location });
  }

  async getByValueRange(minValue?: number, maxValue?: number): Promise<ApiResponse<Asset[]>> {
    return this.getAll({ minValue, maxValue });
  }
}

// Export singleton instance
export const assetService = new AssetService();
export default assetService;