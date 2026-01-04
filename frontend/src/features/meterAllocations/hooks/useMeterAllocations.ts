import { useCallback } from 'react';
import { meterAllocationService, type PaginationOptions, type PaginationResult } from '../services/meterAllocationService';
import type { MeterAllocation, MeterAllocationInput, MeterAllocationFilters } from '../types';
import { useApi, useApiMutation } from '@/hooks/useApi';

export function useMeterAllocations(options?: PaginationOptions, filters?: MeterAllocationFilters) {
  const query = useCallback(() => meterAllocationService.getAll(options, filters), [options, filters]);
  return useApi<PaginationResult<MeterAllocation>>(query, [options, filters]);
}

export function useMeterAllocation(id: string) {
  const query = useCallback(() => meterAllocationService.getById(id), [id]);
  return useApi<MeterAllocation>(query, [id]);
}

export function useCreateMeterAllocation() {
  return useApiMutation<MeterAllocation, MeterAllocationInput>((data) => meterAllocationService.create(data));
}

export function useUpdateMeterAllocation() {
  return useApiMutation<MeterAllocation, { id: string; data: Partial<MeterAllocationInput> }>(
    ({ id, data }) => meterAllocationService.update(id, data)
  );
}

export function useDeleteMeterAllocation() {
  return useApiMutation<void, string>((id) => meterAllocationService.delete(id));
}
