import { useCallback } from 'react';
import type { Tenant, TenantInput } from '../types/tenant';
import { useApi, useApiMutation } from './useApi';
import { tenantService } from '../services/tenantService';

export function useTenants() {
  const query = useCallback(() => tenantService.getAll(), []);
  const { data, loading, error, refetch } = useApi<Tenant[]>(query, []);

  return {
    tenants: data || [],
    loading,
    error,
    refetch,
  };
}

export function useTenant(id: string | undefined | null) {
  const query = useCallback(() => {
    if (!id || id.trim() === '' || id === '__SKIP__') {
      return Promise.resolve({ success: true, data: undefined as Tenant | undefined });
    }
    return tenantService.getById(id);
  }, [id]);
  return useApi<Tenant>(query, [id]);
}

export function useCreateTenant() {
  return useApiMutation<Tenant, TenantInput>((data) => tenantService.create(data));
}

export function useUpdateTenant() {
  return useApiMutation<Tenant, { id: string; data: Partial<TenantInput> }>(
    ({ id, data }) => tenantService.update(id, data)
  );
}

export function useDeleteTenant() {
  return useApiMutation<void, string>((id) => tenantService.delete(id));
}
