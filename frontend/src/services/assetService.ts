import type { Asset, AssetInput, AssetListResponse, AssetFilters } from '../types/asset';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';
import { API_ENDPOINTS, PAGINATION_DEFAULTS } from '../constants/api';

class AssetService {
  async getAll(filters?: AssetFilters): Promise<ApiResponse<AssetListResponse>> {
    const params = {
      page: filters?.page || PAGINATION_DEFAULTS.PAGE,
      limit: filters?.limit || PAGINATION_DEFAULTS.LIMIT,
      search: filters?.search,
      sortBy: filters?.sortBy,
      sortOrder: filters?.sortOrder,
    };

    return apiClient.get<AssetListResponse>(API_ENDPOINTS.ASSETS, { params });
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
  async search(query: string): Promise<ApiResponse<AssetListResponse>> {
    return this.getAll({ search: query });
  }

  async getByLocation(location: string): Promise<ApiResponse<AssetListResponse>> {
    return this.getAll({ location });
  }

  async getByValueRange(minValue?: number, maxValue?: number): Promise<ApiResponse<AssetListResponse>> {
    return this.getAll({ minValue, maxValue });
  }
}

// Export singleton instance
export const assetService = new AssetService();
export default assetService;