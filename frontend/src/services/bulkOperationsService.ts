import { apiClient } from '@/lib/apiClient';
import type {
  BulkRentCollectionInput,
  BulkPaymentInput,
  BulkReceiptGenerationInput,
  BulkCommunicationInput,
  BulkExportInput,
  BulkOperationResult,
  ReceiptValidationResult,
  BulkExportResponse,
} from '../types/bulkOperations';

export class BulkOperationsService {
  /**
   * Bulk rent collection for multiple units
   */
  async bulkRentCollection(input: BulkRentCollectionInput): Promise<BulkOperationResult> {
    const response = await apiClient.post<BulkOperationResult>('/bulk/rent-collection', {
      ...input,
      billingPeriodStart: input.billingPeriodStart.toISOString(),
      billingPeriodEnd: input.billingPeriodEnd.toISOString(),
    });
    return response.data!;
  }

  /**
   * Bulk payment recording for multiple transactions
   */
  async bulkPaymentRecording(input: BulkPaymentInput): Promise<BulkOperationResult> {
    const response = await apiClient.post<BulkOperationResult>('/bulk/payments', {
      ...input,
      paymentDate: input.paymentDate.toISOString(),
    });
    return response.data!;
  }

  /**
   * Bulk receipt generation for multiple transactions
   */
  async bulkReceiptGeneration(input: BulkReceiptGenerationInput): Promise<BulkOperationResult> {
    const response = await apiClient.post<BulkOperationResult>('/bulk/receipts', input);
    return response.data!;
  }

  /**
   * Bulk communication to tenants
   */
  async bulkTenantCommunication(input: BulkCommunicationInput): Promise<BulkOperationResult> {
    const response = await apiClient.post<BulkOperationResult>('/bulk/communication', input);
    return response.data!;
  }

  /**
   * Bulk data export
   */
  async bulkDataExport(input: BulkExportInput): Promise<BulkExportResponse> {
    const requestData = {
      ...input,
      dateRange: input.dateRange ? {
        start: input.dateRange.start.toISOString(),
        end: input.dateRange.end.toISOString(),
      } : undefined,
    };

    const response = await apiClient.post<BulkExportResponse>('/bulk/export', requestData);
    return response.data!;
  }

  /**
   * Receipt validation - check for missing or invalid receipts
   */
  async validateReceipts(propertyId?: string): Promise<ReceiptValidationResult> {
    const params = propertyId ? { propertyId } : {};
    const response = await apiClient.get<ReceiptValidationResult>('/bulk/validate-receipts', { params });
    return response.data!;
  }
}

export const bulkOperationsService = new BulkOperationsService();