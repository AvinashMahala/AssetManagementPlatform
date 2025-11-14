// Rent transaction status
export enum RentTransactionStatus {
  DRAFT = 'draft',
  FINALIZED = 'finalized',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

// Workflow status for streamlined rent collection process
export enum RentCollectionWorkflowStatus {
  INVOICE_PENDING = 'invoice_pending',     // Invoice not yet generated
  INVOICE_GENERATED = 'invoice_generated', // Invoice generated, ready for notification
  NOTIFICATION_SENT = 'notification_sent', // Notification sent to tenant
  PAYMENT_PENDING = 'payment_pending',     // Waiting for payment
  PAYMENT_PARTIAL = 'payment_partial',     // Partial payment received
  PAYMENT_COMPLETED = 'payment_completed', // Full payment received
  RECEIPT_GENERATED = 'receipt_generated', // Receipt generated
  WORKFLOW_COMPLETED = 'workflow_completed' // Entire workflow finished
}

// Billing method
export enum BillingMethod {
  RELATIVE = 'relative', // Date-to-date billing
  FIXED = 'fixed' // 1st of month billing
}

// Expense action
export enum ExpenseAction {
  ADD = 'add',
  REMOVE = 'remove'
}

// Payment method
export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  CHEQUE = 'cheque',
  CARD = 'card',
  NET_BANKING = 'net_banking',
  PAYTM = 'paytm',
  PHONEPE = 'phonepe',
  AMAZON_PAY = 'amazon_pay',
  OTHER = 'other'
}

// Expense line item
export interface ExpenseLineItem {
  type: string; // Expense type (wifi_internet, food_meals, etc.)
  description: string;
  amount: number;
  action: ExpenseAction;
}

// Meter reading for transaction
export interface MeterReadingForTransaction {
  meterId: string;
  meterReadingId?: string;
  meterName?: string;
  meterType?: string;
  meterNumber?: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  costPerUnit: number;
  fixedCharge: number;
  totalCost: number;
  readingDate?: Date;
  meterPhotoUrl?: string;
}

export interface RentTransaction {
  id: string; // UUID

  // Relationships
  leaseId: string; // UUID reference to leases
  unitId: string; // UUID reference to units
  tenantId: string; // UUID reference to tenants
  propertyId: string; // UUID reference to properties

  // Billing period
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  billingMethod: BillingMethod;
  daysCount: number;

  // Amounts
  baseRent: number;
  maintenanceCharges: number;
  previousBalance: number; // Can be negative (advance) or positive (owed)
  totalMeterCharges: number;
  totalExpenses: number;
  expenses: ExpenseLineItem[];
  totalAmount: number;

  // Payment
  amountPaid: number;
  newBalance: number;
  paidDate?: Date;
  status: RentTransactionStatus;

  // Payment method and reference
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  payments: any[]; // JSONB array of payment records

  // Late fees and penalties
  lateFee: number;
  penaltyAmount: number;

  // Receipt
  receiptNumber?: string;
  receiptGenerated: boolean;

  // Invoice
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoicePdfUrl?: string;

  // Workflow tracking for streamlined process
  workflowStatus: RentCollectionWorkflowStatus;
  invoiceGenerated: boolean;
  invoiceSentDate?: Date;
  notificationSent: boolean;
  notificationSentDate?: Date;
  notificationMethod?: 'email' | 'sms' | 'manual';
  lastPaymentDate?: Date;
  receiptSent: boolean;
  receiptSentDate?: Date;
  workflowCompletedDate?: Date;

  // Notes
  notes?: string;

  // Tracking
  createdBy: string; // UUID reference to users
  updatedBy?: string; // UUID reference to users

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RentTransactionInput {
  leaseId: string;
  unitId: string;
  tenantId: string;
  propertyId: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  billingMethod: BillingMethod;
  daysCount: number;
  baseRent: number;
  maintenanceCharges: number;
  previousBalance: number;
  totalMeterCharges: number;
  totalExpenses: number;
  expenses: ExpenseLineItem[];
  meterReadings?: MeterReadingForTransaction[]; // Optional meter readings
  totalAmount: number;
  amountPaid: number;
  newBalance: number;
  paidDate?: Date;
  status: RentTransactionStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  payments: any[]; // JSONB array of payment records
  lateFee: number;
  penaltyAmount: number;
  receiptNumber?: string;
  receiptGenerated: boolean;

  // Invoice
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoicePdfUrl?: string;

  // Workflow tracking fields
  workflowStatus: RentCollectionWorkflowStatus;
  invoiceGenerated: boolean;
  invoiceSentDate?: Date;
  notificationSent: boolean;
  notificationSentDate?: Date;
  notificationMethod?: 'email' | 'sms' | 'manual';
  lastPaymentDate?: Date;
  receiptSent: boolean;
  receiptSentDate?: Date;
  workflowCompletedDate?: Date;

  notes?: string;
  createdBy: string;
  updatedBy?: string;
}
