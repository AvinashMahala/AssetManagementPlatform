import { useCallback } from 'react';
import type { Unit, UnitInput } from '../types/unit';
import { useApi, useApiMutation } from './useApi';
import { unitService } from '../services/unitService';

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

export function useUnit(id: string) {
  const query = useCallback(() => unitService.getById(id), [id]);
  return useApi<Unit>(query, [id]);
}

export function useCreateUnit() {
  return useApiMutation<Unit, UnitInput>((data) => unitService.create(data));
}

export function useUpdateUnit() {
  return useApiMutation<Unit, { id: string; data: Partial<UnitInput> }>(
    ({ id, data }) => unitService.update(id, data)
  );
}

export function useDeleteUnit() {
  return useApiMutation<void, string>((id) => unitService.delete(id));
}
