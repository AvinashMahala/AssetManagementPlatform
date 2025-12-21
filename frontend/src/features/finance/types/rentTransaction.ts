/**
 * Rent Transaction Types
 * Comprehensive types for rent collection, billing, and payment tracking
 */

export type BillingMethod = 'relative' | 'fixed' | 'monthly' | 'daily' | 'custom';
export type TransactionStatus = 'draft' | 'finalized' | 'paid' | 'cancelled';
export type TransactionPaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';

/**
 * Workflow status for streamlined rent collection process
 */
export const RentCollectionWorkflowStatus = {
  INVOICE_PENDING: 'invoice_pending',     // Invoice not yet generated
  INVOICE_GENERATED: 'invoice_generated', // Invoice generated, ready for notification
  NOTIFICATION_SENT: 'notification_sent', // Notification sent to tenant
  PAYMENT_PENDING: 'payment_pending',     // Waiting for payment
  PAYMENT_PARTIAL: 'payment_partial',     // Partial payment received
  PAYMENT_COMPLETED: 'payment_completed', // Full payment received
  RECEIPT_GENERATED: 'receipt_generated', // Receipt generated
  WORKFLOW_COMPLETED: 'workflow_completed' // Entire workflow finished
} as const;

export type RentCollectionWorkflowStatusType = typeof RentCollectionWorkflowStatus[keyof typeof RentCollectionWorkflowStatus];

/**
 * Expense line item
 */
export interface ExpenseItem {
  id?: string;
  category: string;
  description: string;
  amount: number;
  isRemoved?: boolean;
}

/**
 * Meter reading for utility charges
 */
export interface BillingMeterReadingInput {
  meterId: string;
  meterName: string;
  meterType: 'electricity' | 'water' | 'gas';
  meterNumber?: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  costPerUnit: number;
  fixedCharge: number;
  totalCost: number;
  readingDate: string;
  meterPhotoUrl?: string;
}

/**
 * Payment entry for a transaction
 */
export interface PaymentEntry {
  id?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: TransactionPaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  notes?: string;
  createdAt?: string;
}

/**
 * Tenant share information for multi-tenant units
 */
export interface TenantShare {
  tenantId: string;
  tenantName: string;
  isPrimaryTenant: boolean;
  rentShare: number;
  securityDepositShare: number;
  sharePercentage?: number; // For percentage-based splitting
  shareAmount?: number; // For fixed amount splitting
}

/**
 * Rent Transaction Input (for creating/updating)
 */
export interface RentTransactionInput {
  leaseId: string;
  unitId: string;
  propertyId: string;
  tenantId: string; // Primary tenant
  billingPeriodStart: string;
  billingPeriodEnd: string;
  billingMethod: BillingMethod;
  daysCount?: number;
  
  // Base charges
  baseRent: number;
  maintenanceCharges?: number;
  previousBalance: number;
  
  // Meter readings
  meterReadings: BillingMeterReadingInput[];
  
  // Additional expenses
  expenses: ExpenseItem[];
  
  // Calculated totals
  totalMeterCharges: number;
  totalExpenses: number;
  totalAmount: number;
  
  // Payment tracking
  amountPaid: number;
  newBalance: number;
  payments: PaymentEntry[];
  
  // Status and metadata
  status: TransactionStatus;
  dueDate?: string;
  lateFee?: number;
  penaltyAmount?: number;
  gracePeriodDays?: number;
  
  // Invoice/Receipt
  invoiceNumber?: string;
  receiptNumber?: string;
  receiptGenerated?: boolean;
  
  // Workflow tracking fields
  workflowStatus?: RentCollectionWorkflowStatusType;
  invoiceGenerated?: boolean;
  invoiceSentDate?: string;
  notificationSent?: boolean;
  notificationSentDate?: string;
  notificationMethod?: 'email' | 'sms' | 'manual';
  lastPaymentDate?: string;
  receiptSent?: boolean;
  receiptSentDate?: string;
  workflowCompletedDate?: string;
  
  // Multi-tenant support
  tenantShares?: TenantShare[];
  splitEqually?: boolean;
  
  notes?: string;
}

/**
 * Rent Transaction (full entity from backend)
 */
export interface RentTransaction extends RentTransactionInput {
  id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  
  // Workflow tracking fields (required in full entity)
  workflowStatus: RentCollectionWorkflowStatusType;
  invoiceGenerated: boolean;
  notificationSent: boolean;
  receiptSent: boolean;
  
  // Populated relationships
  unit?: {
    id: string;
    unitNumber: string;
    unitName?: string;
  };
  property?: {
    id: string;
    name: string;
    addressStreet?: string;
    addressCity?: string;
  };
  tenant?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  lease?: {
    id: string;
    monthlyRent: number;
    maintenanceCharges?: number;
  };
}

/**
 * Invoice generation request
 */
export interface InvoiceGenerationRequest {
  transactionId: string;
  includePropertyLogo?: boolean;
  includePaymentQR?: boolean;
  templateId?: string;
}

/**
 * Receipt generation request
 */
export interface TransactionReceiptGenerationRequest {
  transactionId: string;
  paymentId?: string;
  includePropertyLogo?: boolean;
  includeDigitalSignature?: boolean;
  templateId?: string;
}

/**
 * Invoice/Receipt data structure
 */
export interface InvoiceReceiptData {
  documentType: 'invoice' | 'receipt';
  documentNumber: string;
  documentDate: string;
  
  // Property details
  property: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    website?: string;
    logo?: string;
  };
  
  // Tenant details
  tenant: {
    name: string;
    unitNumber: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  
  // Billing period
  billingPeriod: {
    start: string;
    end: string;
    month: string;
    year: string;
  };
  
  // Line items
  lineItems: {
    description: string;
    details?: string;
    quantity?: number;
    rate?: number;
    amount: number;
  }[];
  
  // Totals
  subtotal: number;
  previousBalance: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  
  // Payment details (for receipt)
  payments?: {
    date: string;
    method: string;
    amount: number;
    reference?: string;
  }[];
  
  // Additional info
  dueDate?: string;
  lateFee?: number;
  notes?: string;
  terms?: string;
}

/**
 * Late fee configuration
 */
export interface LateFeeConfig {
  enabled: boolean;
  gracePeriodDays: number;
  feeType: 'fixed' | 'percentage';
  feeAmount?: number;
  feePercentage?: number;
  maxFeeAmount?: number;
  compoundDaily?: boolean;
}

/**
 * Rent collection wizard state
 */
export interface RentCollectionState {
  currentStep: number;
  totalSteps: number;
  transaction: Partial<RentTransactionInput>;
  meterReadings: BillingMeterReadingInput[];
  expenses: ExpenseItem[];
  payments: PaymentEntry[];
  validationErrors: { [key: string]: string };
  isSubmitting: boolean;
}
