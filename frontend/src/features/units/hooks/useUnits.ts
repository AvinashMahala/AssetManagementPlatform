import { useCallback } from 'react';
import type { Unit, UnitInput } from '@/features/units/types';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { unitService } from '@/features/units/services/unitService';

export function useUnits(propertyId?: string) {
  const query = useCallback(() => unitService.getAll(propertyId), [propertyId]);
  const { data, loading, error, refetch } = useApi<Unit[]>(query, [propertyId]);

  return {
    units: data || [],
    loading,
    error,
    refetch,
  };
}

export function useUnit(id: string | undefined | null) {
  const query = useCallback(() => {
    if (!id || id.trim() === '' || id === '__SKIP__') {
      return Promise.resolve({ success: true, data: undefined as Unit | undefined });
    }
    return unitService.getById(id);
  }, [id]);
  return useApi<Unit>(query, [id]);
}

export function useCreateUnit() {
  return useApiMutation<any, { data: UnitInput; audit?: boolean }>((vars) => unitService.create(vars.data, vars.audit));
}

export function useUpdateUnit() {
  return useApiMutation<any, { id: string; data: Partial<UnitInput>; audit?: boolean }>(
    ({ id, data, audit }) => unitService.update(id, data, audit)
  );
}

export function useDeleteUnit() {
  return useApiMutation<void, string>((id) => unitService.delete(id));
}

export function useUnitAnalytics(id: string) {
  const query = useCallback(() => unitService.getAnalytics(id), [id]);
  return useApi<any>(query, [id]);
}
