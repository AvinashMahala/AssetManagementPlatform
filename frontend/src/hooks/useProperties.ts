import { useState, useCallback } from 'react';
import type { Property, PropertyInput, PropertyFilters } from '../types/property';
import { useApi, useApiMutation } from './useApi';
import { propertyService } from '../services/propertyService';

export function useProperties(filters?: PropertyFilters) {
  const [currentFilters, setCurrentFilters] = useState<PropertyFilters>(filters || {});

  const query = useCallback(() => {
    return propertyService.getAll(currentFilters);
  }, [currentFilters]);

  const { data, loading, error, refetch, displayError } = useApi<Property[]>(query, [currentFilters]);

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setCurrentFilters({});
  }, []);

  // Data is now returned directly as an array
  const properties = Array.isArray(data) ? data : [];
  

  return {
    properties: Array.isArray(properties) ? properties : [],
    loading,
    error,
    displayError,
    refetch,
    filters: currentFilters,
    updateFilters,
    resetFilters,
  };
}

export function useProperty(id: string | undefined | null) {
  const query = useCallback(() => {
    if (!id || id.trim() === '' || id === '__SKIP__') {
      return Promise.resolve({ success: true, data: undefined as Property | undefined });
    }
    return propertyService.getById(id);
  }, [id]);
  return useApi<Property>(query, [id]);
}

export function useCreateProperty() {
  return useApiMutation<Property, PropertyInput>((propertyData) => propertyService.create(propertyData));
}

export function useUpdateProperty() {
  return useApiMutation<Property, { id: string; data: Partial<PropertyInput> }>(
    ({ id, data }) => propertyService.update(id, data)
  );
}

export function useDeleteProperty() {
  return useApiMutation<void, string>((id) => propertyService.delete(id));
}

export function usePropertySearch() {
  const [searchQuery, setSearchQuery] = useState('');

  const query = useCallback(() => {
    if (!searchQuery.trim()) {
      return propertyService.getAll();
    }
    return propertyService.search(searchQuery);
  }, [searchQuery]);

  const { data, loading, error, refetch } = useApi<Property[]>(query, [searchQuery]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Data is now returned directly as an array
  const properties = Array.isArray(data) ? data : [];

  return {
    properties: Array.isArray(properties) ? properties : [],
    loading,
    error,
    refetch,
    searchQuery,
    search,
    clearSearch,
  };
}