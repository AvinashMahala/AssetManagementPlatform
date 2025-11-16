export interface BulkRentCollectionInput {
  unitIds: string[];
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  applyExpenses?: boolean;
  expenseIds?: string[];
  skipUnitsWithExistingTransactions?: boolean;
}

export interface BulkPaymentInput {
  transactionIds: string[];
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  paymentReference?: string;
}

export interface BulkReceiptGenerationInput {
  transactionIds: string[];
  regenerateExisting?: boolean;
}

export interface BulkCommunicationInput {
  tenantIds: string[];
  subject: string;
  message: string;
  channels: ('email' | 'sms' | 'whatsapp')[];
  attachments?: string[];
}

export interface BulkExportInput {
  entityType: 'properties' | 'units' | 'tenants' | 'transactions' | 'payments' | 'receipts';
  dateRange?: {
    start: Date;
    end: Date;
  };
  propertyIds?: string[];
  unitIds?: string[];
  tenantIds?: string[];
  format: 'csv' | 'excel' | 'json' | 'pdf';
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
  results?: any[];
}

export interface ReceiptValidationResult {
  valid: number;
  invalid: number;
  missing: number;
  details: ReceiptValidationDetail[];
}

export interface ReceiptValidationDetail {
  transactionId: string;
  receiptNumber?: string;
  receiptGenerated: boolean;
  status: 'valid' | 'invalid' | 'missing';
  issues: string[];
}

export interface BulkExportResponse {
  fileUrl: string;
  fileName: string;
}