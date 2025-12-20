import { useCallback } from 'react';
import type { RentTransaction, RentTransactionInput, InvoiceGenerationRequest, ReceiptGenerationRequest } from '@/types/rentTransaction';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { rentTransactionService } from '@/features/finance/services/rentTransactionService';

/**
 * Get all rent transactions with optional filters
 */
export function useRentTransactions(propertyId?: string, unitId?: string, status?: string) {
  const query = useCallback(
    () => rentTransactionService.getAll(propertyId, unitId, status),
    [propertyId, unitId, status]
  );
  const { data, loading, error, refetch } = useApi<RentTransaction[]>(query, [propertyId, unitId, status]);

  return {
    transactions: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Get single rent transaction by ID
 */
export function useRentTransaction(id: string) {
  const query = useCallback(() => rentTransactionService.getById(id), [id]);
  return useApi<RentTransaction>(query, [id]);
}

/**
 * Get current month transaction for a unit
 */
export function useCurrentMonthTransaction(unitId: string) {
  const query = useCallback(() => rentTransactionService.getCurrentMonthTransaction(unitId), [unitId]);
  const { data, loading, error, refetch } = useApi<RentTransaction | null>(query, [unitId]);

  return {
    transaction: data,
    loading,
    error,
    refetch,
  };
}

/**
 * Get transaction history for a unit
 */
export function useUnitTransactionHistory(unitId: string, limit?: number) {
  const query = useCallback(() => rentTransactionService.getUnitHistory(unitId, limit), [unitId, limit]);
  const { data, loading, error, refetch } = useApi<RentTransaction[]>(query, [unitId, limit]);

  return {
    history: data || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Get last meter readings for a unit
 */
export function useLastMeterReadings(unitId: string) {
  const query = useCallback(() => rentTransactionService.getLastMeterReadings(unitId), [unitId]);
  return useApi<any[]>(query, [unitId]);
}

/**
 * Create rent transaction
 */
export function useCreateRentTransaction() {
  return useApiMutation<RentTransaction, RentTransactionInput>(
    (data) => rentTransactionService.create(data)
  );
}

/**
 * Update rent transaction
 */
export function useUpdateRentTransaction() {
  return useApiMutation<RentTransaction, { id: string; data: Partial<RentTransactionInput> }>(
    ({ id, data }) => rentTransactionService.update(id, data)
  );
}

/**
 * Delete rent transaction
 */
export function useDeleteRentTransaction() {
  return useApiMutation<void, string>((id) => rentTransactionService.delete(id));
}

/**
 * Generate invoice
 */
export function useGenerateInvoice() {
  return useApiMutation<{ pdfUrl: string; invoiceNumber: string }, InvoiceGenerationRequest>(
    (request) => rentTransactionService.generateInvoice(request)
  );
}

/**
 * Generate receipt
 */
export function useGenerateReceipt() {
  return useApiMutation<{ pdfUrl: string; receiptNumber: string }, ReceiptGenerationRequest>(
    (request) => rentTransactionService.generateReceipt(request)
  );
}

/**
 * Record payment
 */
export function useRecordPayment() {
  return useApiMutation<RentTransaction, {
    transactionId: string;
    payment: {
      amount: number;
      paymentDate: string;
      paymentMethod: string;
      transactionId?: string;
      paymentReference?: string;
      notes?: string;
    };
  }>(({ transactionId, payment }) => rentTransactionService.recordPayment(transactionId, payment));
}

/**
 * Calculate late fees
 */
export function useCalculateLateFees(transactionId: string) {
  const query = useCallback(
    () => rentTransactionService.calculateLateFees(transactionId),
    [transactionId]
  );
  return useApi<{ lateFee: number; daysOverdue: number }>(query, [transactionId]);
}

/**
 * Preview invoice data
 */
export function usePreviewInvoice(transactionId: string) {
  const query = useCallback(
    () => rentTransactionService.previewInvoice(transactionId),
    [transactionId]
  );
  return useApi<any>(query, [transactionId]);
}

/**
 * Preview receipt data
 */
export function usePreviewReceipt(transactionId: string) {
  const query = useCallback(
    () => rentTransactionService.previewReceipt(transactionId),
    [transactionId]
  );
  return useApi<any>(query, [transactionId]);
}
