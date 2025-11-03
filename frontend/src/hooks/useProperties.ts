import { useState, useCallback } from 'react';
import type { Property, PropertyInput, PropertyFilters, PropertyListResponse } from '../types/property';
import { useApi, useApiMutation } from './useApi';
import { propertyService } from '../services/propertyService';

export function useProperties(filters?: PropertyFilters) {
  const [currentFilters, setCurrentFilters] = useState<PropertyFilters>(filters || {});

  const query = useCallback(() => {
    const token = localStorage.getItem('token');
    console.log('[useProperties] Making API call with filters:', currentFilters);
    console.log('[useProperties] Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
    console.log('[useProperties] Full localStorage:', { 
      token: token ? 'exists' : 'missing',
      refreshToken: localStorage.getItem('refreshToken') ? 'exists' : 'missing'
    });
    return propertyService.getAll(currentFilters);
  }, [currentFilters]);

  const { data, loading, error, refetch } = useApi<PropertyListResponse>(query, [currentFilters]);

  const updateFilters = useCallback((newFilters: Partial<PropertyFilters>) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setCurrentFilters({});
  }, []);

  // Extract properties from the response structure
  const properties = data?.properties || [];
  
  // Debug logging
  console.log('[useProperties] Data received:', data);
  console.log('[useProperties] Properties extracted:', properties);
  console.log('[useProperties] Loading:', loading);
  console.log('[useProperties] Error:', error);

  return {
    properties: Array.isArray(properties) ? properties : [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
    filters: currentFilters,
    updateFilters,
    resetFilters,
  };
}

export function useProperty(id: string) {
  const query = useCallback(() => propertyService.getById(id), [id]);
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

  const { data, loading, error, refetch } = useApi<PropertyListResponse>(query, [searchQuery]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Extract properties from the response structure
  const properties = data?.properties || [];

  return {
    properties: Array.isArray(properties) ? properties : [],
    pagination: data?.pagination,
    loading,
    error,
    refetch,
    searchQuery,
    search,
    clearSearch,
  };
}