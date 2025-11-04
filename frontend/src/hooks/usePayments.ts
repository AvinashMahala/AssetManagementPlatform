import { useCallback } from 'react';
import type { RentPayment, RentPaymentInput } from '../types/payment';
import { useApi, useApiMutation } from './useApi';
import { paymentService } from '../services/paymentService';

export function usePayments(leaseId?: string, tenantId?: string) {
  const query = useCallback(() => paymentService.getAll(leaseId, tenantId), [leaseId, tenantId]);
  const { data, loading, error, refetch } = useApi<RentPayment[]>(query, [leaseId, tenantId]);

  return {
    payments: data || [],
    loading,
    error,
    refetch,
  };
}

export function usePayment(id: string) {
  const query = useCallback(() => paymentService.getById(id), [id]);
  return useApi<RentPayment>(query, [id]);
}

export function useCreatePayment() {
  return useApiMutation<RentPayment, RentPaymentInput>((data) => paymentService.create(data));
}

export function useUpdatePayment() {
  return useApiMutation<RentPayment, { id: string; data: Partial<RentPaymentInput> }>(
    ({ id, data }) => paymentService.update(id, data)
  );
}

export function useDeletePayment() {
  return useApiMutation<void, string>((id) => paymentService.delete(id));
}
