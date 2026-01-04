import { useCallback } from 'react';
import { utilityTypeService, type PaginationOptions, type PaginationResult } from '../services/utilityTypeService';
import type { UtilityType, UtilityTypeInput, UtilityTypeFilters } from '../types';
import { useApi, useApiMutation } from '@/hooks/useApi';

export function useUtilityTypes(options?: PaginationOptions, filters?: UtilityTypeFilters) {
  const query = useCallback(() => utilityTypeService.getAll(options, filters), [options, filters]);
  return useApi<PaginationResult<UtilityType>>(query, [options, filters]);
}

export function useUtilityType(id: string) {
  const query = useCallback(() => utilityTypeService.getById(id), [id]);
  return useApi<UtilityType>(query, [id]);
}

export function useCreateUtilityType() {
  return useApiMutation<UtilityType, UtilityTypeInput>((data) => utilityTypeService.create(data));
}

export function useUpdateUtilityType() {
  return useApiMutation<UtilityType, { id: string; data: Partial<UtilityTypeInput> }>(
    ({ id, data }) => utilityTypeService.update(id, data)
  );
}

export function useDeleteUtilityType() {
  return useApiMutation<void, string>((id) => utilityTypeService.delete(id));
}
