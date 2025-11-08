import type { RentTransaction, RentTransactionInput, InvoiceGenerationRequest, ReceiptGenerationRequest, InvoiceReceiptData } from '../types/rentTransaction';
import type { ApiResponse } from '../types/api';
import { apiClient } from './apiClient';

class RentTransactionService {
  /**
   * Get all rent transactions
   */
  async getAll(propertyId?: string, unitId?: string, status?: string): Promise<ApiResponse<RentTransaction[]>> {
    let url = '/api/rent-transactions';
    const params = new URLSearchParams();
    if (propertyId) params.append('propertyId', propertyId);
    if (unitId) params.append('unitId', unitId);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    return apiClient.get<RentTransaction[]>(url);
  }

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<ApiResponse<RentTransaction>> {
    return apiClient.get<RentTransaction>(`/api/rent-transactions/${id}`);
  }

  /**
   * Get current month transaction for a unit
   */
  async getCurrentMonthTransaction(unitId: string): Promise<ApiResponse<RentTransaction | null>> {
    return apiClient.get<RentTransaction | null>(`/api/rent-transactions/unit/${unitId}/current-month`);
  }

  /**
   * Get transaction history for a unit
   */
  async getUnitHistory(unitId: string, limit?: number): Promise<ApiResponse<RentTransaction[]>> {
    let url = `/api/rent-transactions/unit/${unitId}/history`;
    if (limit) url += `?limit=${limit}`;
    return apiClient.get<RentTransaction[]>(url);
  }

  /**
   * Create new rent transaction (draft)
   */
  async create(data: RentTransactionInput): Promise<ApiResponse<RentTransaction>> {
    return apiClient.post<RentTransaction>('/api/rent-transactions', data);
  }

  /**
   * Update rent transaction
   */
  async update(id: string, data: Partial<RentTransactionInput>): Promise<ApiResponse<RentTransaction>> {
    return apiClient.put<RentTransaction>(`/api/rent-transactions/${id}`, data);
  }

  /**
   * Delete rent transaction
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/api/rent-transactions/${id}`);
  }

  /**
   * Generate invoice for transaction
   */
  async generateInvoice(request: InvoiceGenerationRequest): Promise<ApiResponse<{ pdfUrl: string; invoiceNumber: string }>> {
    return apiClient.post<{ pdfUrl: string; invoiceNumber: string }>('/api/rent-transactions/generate-invoice', request);
  }

  /**
   * Generate receipt for transaction
   */
  async generateReceipt(request: ReceiptGenerationRequest): Promise<ApiResponse<{ pdfUrl: string; receiptNumber: string }>> {
    return apiClient.post<{ pdfUrl: string; receiptNumber: string }>('/api/rent-transactions/generate-receipt', request);
  }

  /**
   * Record payment for transaction
   */
  async recordPayment(transactionId: string, payment: {
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    transactionId?: string;
    paymentReference?: string;
    notes?: string;
  }): Promise<ApiResponse<RentTransaction>> {
    return apiClient.post<RentTransaction>(`/api/rent-transactions/${transactionId}/record-payment`, payment);
  }

  /**
   * Calculate late fees for transaction
   */
  async calculateLateFees(transactionId: string): Promise<ApiResponse<{ lateFee: number; daysOverdue: number }>> {
    return apiClient.get<{ lateFee: number; daysOverdue: number }>(`/api/rent-transactions/${transactionId}/calculate-late-fees`);
  }

  /**
   * Get last meter readings for a unit
   */
  async getLastMeterReadings(unitId: string): Promise<ApiResponse<{
    meterId: string;
    meterName: string;
    meterType: string;
    meterNumber: string;
    lastReading: number;
    readingDate: string;
    costPerUnit: number;
    fixedCharge: number;
  }[]>> {
    return apiClient.get<any[]>(`/api/rent-transactions/unit/${unitId}/last-meter-readings`);
  }

  /**
   * Preview invoice data (before PDF generation)
   */
  async previewInvoice(transactionId: string): Promise<ApiResponse<InvoiceReceiptData>> {
    return apiClient.get<InvoiceReceiptData>(`/api/rent-transactions/${transactionId}/preview-invoice`);
  }

  /**
   * Preview receipt data (before PDF generation)
   */
  async previewReceipt(transactionId: string): Promise<ApiResponse<InvoiceReceiptData>> {
    return apiClient.get<InvoiceReceiptData>(`/api/rent-transactions/${transactionId}/preview-receipt`);
  }

  /**
   * Get monthly summary for property
   */
  async getMonthlySummary(propertyId: string, month: string, year: string): Promise<ApiResponse<{
    totalTransactions: number;
    totalRent: number;
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
    transactions: RentTransaction[];
  }>> {
    return apiClient.get<any>(`/api/rent-transactions/property/${propertyId}/monthly-summary?month=${month}&year=${year}`);
  }
}

export const rentTransactionService = new RentTransactionService();
export default rentTransactionService;
