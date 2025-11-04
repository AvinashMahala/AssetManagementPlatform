import { useState, useCallback } from 'react';
import type { Asset, AssetInput, AssetFilters } from '../types/asset';
import { useApi, useApiMutation } from './useApi';
import { assetService } from '../services/assetService';

export function useAssets(filters?: AssetFilters) {
  const [currentFilters, setCurrentFilters] = useState<AssetFilters>(filters || {});

  const query = useCallback(() => {
    return assetService.getAll(currentFilters);
  }, [currentFilters]);

  const { data, loading, error, refetch } = useApi<Asset[]>(query, [currentFilters]);

  const updateFilters = useCallback((newFilters: Partial<AssetFilters>) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setCurrentFilters({});
  }, []);

  return {
    assets: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
    filters: currentFilters,
    updateFilters,
    resetFilters,
  };
}

export function useAsset(id: number) {
  const query = useCallback(() => assetService.getById(id), [id]);
  return useApi<Asset>(query, [id]);
}

export function useCreateAsset() {
  return useApiMutation<Asset, AssetInput>((assetData) => assetService.create(assetData));
}

export function useUpdateAsset() {
  return useApiMutation<Asset, { id: number; data: Partial<AssetInput> }>(
    ({ id, data }) => assetService.update(id, data)
  );
}

export function useDeleteAsset() {
  return useApiMutation<void, number>((id) => assetService.delete(id));
}

export function useAssetSearch() {
  const [searchQuery, setSearchQuery] = useState('');

  const query = useCallback(() => {
    if (!searchQuery.trim()) {
      return assetService.getAll();
    }
    return assetService.search(searchQuery);
  }, [searchQuery]);

  const { data, loading, error, refetch } = useApi<Asset[]>(query, [searchQuery]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    assets: Array.isArray(data) ? data : [],
    loading,
    error,
    refetch,
    searchQuery,
    search,
    clearSearch,
  };
}