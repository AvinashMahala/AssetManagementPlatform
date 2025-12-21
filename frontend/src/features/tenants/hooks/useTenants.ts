import { useCallback } from 'react';
import type { Tenant, TenantInput } from '@/features/tenants/types';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { tenantService } from '@/features/tenants/services/tenantService';

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
