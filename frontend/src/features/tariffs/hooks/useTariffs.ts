import { useCallback } from 'react';
import { tariffService, type PaginationOptions, type PaginationResult } from '../services/tariffService';
import type { Tariff, TariffInput, TariffFilters } from '../types';
import { useApi, useApiMutation } from '@/hooks/useApi';

export function useTariffs(options?: PaginationOptions, filters?: TariffFilters) {
  const query = useCallback(() => tariffService.getAll(options, filters), [options, filters]);
  return useApi<PaginationResult<Tariff>>(query, [options, filters]);
}

export function useTariff(id: string) {
  const query = useCallback(() => tariffService.getById(id), [id]);
  return useApi<Tariff>(query, [id]);
}

export function useCreateTariff() {
  return useApiMutation<Tariff, TariffInput>((data) => tariffService.create(data));
}

export function useUpdateTariff() {
  return useApiMutation<Tariff, { id: string; data: Partial<TariffInput> }>(
    ({ id, data }) => tariffService.update(id, data)
  );
}

export function useDeleteTariff() {
  return useApiMutation<void, string>((id) => tariffService.delete(id));
}

export function useApplicableTariff(utilityTypeId: string, date: string, subscriptionId?: string, meterId?: string) {
  const query = useCallback(
    () => tariffService.getApplicable(utilityTypeId, date, subscriptionId, meterId),
    [utilityTypeId, date, subscriptionId, meterId]
  );
  return useApi<Tariff>(query, [utilityTypeId, date, subscriptionId, meterId]);
}
