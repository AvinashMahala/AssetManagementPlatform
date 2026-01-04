import { useCallback } from 'react';
import { utilitySubscriptionService, type PaginationOptions, type PaginationResult } from '../services/utilitySubscriptionService';
import type { UtilitySubscription, UtilitySubscriptionInput, UtilitySubscriptionFilters } from '../types';
import { useApi, useApiMutation } from '@/hooks/useApi';

export function useUtilitySubscriptions(options?: PaginationOptions, filters?: UtilitySubscriptionFilters) {
  const query = useCallback(() => utilitySubscriptionService.getAll(options, filters), [options, filters]);
  return useApi<PaginationResult<UtilitySubscription>>(query, [options, filters]);
}

export function useUtilitySubscription(id: string) {
  const query = useCallback(() => utilitySubscriptionService.getById(id), [id]);
  return useApi<UtilitySubscription>(query, [id]);
}

export function useCreateUtilitySubscription() {
  return useApiMutation<UtilitySubscription, UtilitySubscriptionInput>((data) => utilitySubscriptionService.create(data));
}

export function useUpdateUtilitySubscription() {
  return useApiMutation<UtilitySubscription, { id: string; data: Partial<UtilitySubscriptionInput> }>(
    ({ id, data }) => utilitySubscriptionService.update(id, data)
  );
}

export function useDeleteUtilitySubscription() {
  return useApiMutation<void, string>((id) => utilitySubscriptionService.delete(id));
}
