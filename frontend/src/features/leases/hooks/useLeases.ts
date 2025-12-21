import { useCallback } from 'react';
import type { Lease, LeaseInput } from '../types/lease';
import { useApi, useApiMutation } from '../../../hooks/useApi';
import { leaseService } from '../services/leaseService';

export function useLeases(unitId?: string, tenantId?: string) {
  const query = useCallback(() => leaseService.getAll(unitId, tenantId), [unitId, tenantId]);
  const { data, loading, error, refetch } = useApi<Lease[]>(query, [unitId, tenantId]);

  return {
    leases: data || [],
    loading,
    error,
    refetch,
  };
}

export function useLease(id: string) {
  const query = useCallback(() => leaseService.getById(id), [id]);
  return useApi<Lease>(query, [id]);
}

export function useCreateLease() {
  return useApiMutation<Lease, LeaseInput>((data) => leaseService.create(data));
}

export function useUpdateLease() {
  return useApiMutation<Lease, { id: string; data: Partial<LeaseInput> }>(
    ({ id, data }) => leaseService.update(id, data)
  );
}

export function useDeleteLease() {
  return useApiMutation<void, string>((id) => leaseService.delete(id));
}
