import { useCallback } from 'react';
import type { UnitUtility, UnitUtilityInput } from '@/features/units/types';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { unitUtilityService } from '@/features/units/services/unitUtilityService';

export function useUnitUtilities(unitId?: string, propertyId?: string) {
  // Wrap service call to gracefully handle 404 as empty list
  const query = useCallback(async () => {
    const resp = await unitUtilityService.getAll(unitId, propertyId);
    if (!resp.success && resp.error && String(resp.error.code).toUpperCase().startsWith('HTTP_404')) {
      return { success: true, data: [] } as ApiResponse<UnitUtility[]>;
    }
    return resp;
  }, [unitId, propertyId]);

  const { data, loading, error, refetch } = useApi<UnitUtility[]>(query, [unitId, propertyId]);

  return {
    utilities: data || [],
    loading,
    error,
    refetch,
  };
}

export function useUnitUtility(id: string) {
  const query = useCallback(() => unitUtilityService.getById(id), [id]);
  return useApi<UnitUtility>(query, [id]);
}

export function useCreateUnitUtility() {
  return useApiMutation<UnitUtility, UnitUtilityInput>((data) => unitUtilityService.create(data));
}

export function useUpdateUnitUtility() {
  return useApiMutation<UnitUtility, { id: string; data: Partial<UnitUtilityInput> }>(
    ({ id, data }) => unitUtilityService.update(id, data)
  );
}

export function useDeleteUnitUtility() {
  return useApiMutation<void, string>((id) => unitUtilityService.delete(id));
}

export function useToggleUnitUtility() {
  return useApiMutation<void, { id: string; isEnabled: boolean }>(
    ({ id, isEnabled }) => unitUtilityService.toggleStatus(id, isEnabled)
  );
}

export function useUnitUtilityCharges(unitId: string, startDate: string, endDate: string) {
  const query = useCallback(
    () => unitUtilityService.calculateCharges(unitId, startDate, endDate),
    [unitId, startDate, endDate]
  );
  return useApi<any>(query, [unitId, startDate, endDate]);
}

export function useUnitUtilitySummary(unitId: string) {
  const query = useCallback(() => unitUtilityService.getSummary(unitId), [unitId]);
  return useApi<any>(query, [unitId]);
}

export function useValidateUnitUtilityConfiguration(unitId: string) {
  const query = useCallback(() => unitUtilityService.validateConfiguration(unitId), [unitId]);
  return useApi<{ isValid: boolean; errors: string[] }>(query, [unitId]);
}