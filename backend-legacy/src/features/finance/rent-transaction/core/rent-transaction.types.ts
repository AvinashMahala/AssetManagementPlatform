
export enum RentTransactionStatus {
  DRAFT = 'draft',
  FINALIZED = 'finalized',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

export enum RentCollectionWorkflowStatus {
  INVOICE_PENDING = 'invoice_pending',
  INVOICE_GENERATED = 'invoice_generated',
  NOTIFICATION_SENT = 'notification_sent',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_PARTIAL = 'payment_partial',
  PAYMENT_COMPLETED = 'payment_completed',
  RECEIPT_GENERATED = 'receipt_generated',
  WORKFLOW_COMPLETED = 'workflow_completed'
}

export enum BillingMethod {
  RELATIVE = 'relative',
  FIXED = 'fixed'
}

export enum ExpenseAction {
  ADD = 'add',
  REMOVE = 'remove'
}

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

export interface ExpenseLineItem {
  type: string;
  description: string;
  amount: number;
  action: ExpenseAction;
}

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

export interface RentTransactionMeterReading {
  id: string;
  transactionId: string;
  meterId: string;
  meterReadingId?: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  costPerUnit: number;
  fixedCharge: number;
  totalCost: number;
  createdAt: Date;
}

export interface RentTransactionMeterReadingInput {
  transactionId: string;
  meterId: string;
  meterReadingId?: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  costPerUnit: number;
  fixedCharge: number;
  totalCost: number;
}

export interface RentTransaction {
  id: string;
  leaseId: string;
  unitId: string;
  tenantId: string;
  propertyId: string;
  
  // Billing period
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  billingMethod: BillingMethod;
  daysCount: number;
  
  // Amounts
  baseRent: number;
  maintenanceCharges: number;
  previousBalance: number;
  totalMeterCharges: number;
  totalExpenses: number;
  expenses: ExpenseLineItem[];
  totalAmount: number;
  
  // Payment
  amountPaid: number;
  newBalance: number;
  paidDate?: Date;
  status: RentTransactionStatus;
  
  // Payment Details (Legacy Compat)
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  payments?: any[]; // JSONB
  
  // Fees
  lateFee?: number;
  penaltyAmount?: number;
  
  // Receipt
  receiptNumber?: string;
  receiptGenerated?: boolean;
  receiptUrl?: string; // New field
  receiptSent?: boolean;
  receiptSentDate?: Date;
  
  // Invoice
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoiceUrl?: string; // New field (was invoicePdfUrl)
  invoicePdfUrl?: string; // Legacy alias
  invoiceGenerated?: boolean;
  invoiceSentDate?: Date;
  
  // Workflow
  workflowStatus: RentCollectionWorkflowStatus;
  notificationSent?: boolean;
  notificationSentDate?: Date;
  notificationMethod?: 'email' | 'sms' | 'manual';
  lastPaymentDate?: Date;
  workflowCompletedDate?: Date;
  
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentTransactionParams {
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
  meterReadings?: Omit<RentTransactionMeterReadingInput, 'transactionId'>[];
  totalAmount: number;
  amountPaid: number;
  newBalance: number;
  paidDate?: Date;
  status: RentTransactionStatus;
  workflowStatus: RentCollectionWorkflowStatus;
  
  // Legacy/Extended fields
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  payments?: any[];
  lateFee?: number;
  penaltyAmount?: number;
  receiptNumber?: string;
  receiptGenerated?: boolean;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoicePdfUrl?: string;
  invoiceGenerated?: boolean;
  invoiceSentDate?: Date;
  notificationSent?: boolean;
  notificationSentDate?: Date;
  notificationMethod?: 'email' | 'sms' | 'manual';
  lastPaymentDate?: Date;
  receiptSent?: boolean;
  receiptSentDate?: Date;
  workflowCompletedDate?: Date;

  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  createdBy?: string;
}

export interface UpdateRentTransactionParams {
  billingPeriodStart?: Date;
  billingPeriodEnd?: Date;
  billingMethod?: BillingMethod;
  daysCount?: number;
  baseRent?: number;
  maintenanceCharges?: number;
  previousBalance?: number;
  totalMeterCharges?: number;
  totalExpenses?: number;
  expenses?: ExpenseLineItem[];
  totalAmount?: number;
  amountPaid?: number;
  newBalance?: number;
  paidDate?: Date;
  status?: RentTransactionStatus;
  workflowStatus?: RentCollectionWorkflowStatus;
  
  // Legacy/Extended fields
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  payments?: any[];
  lateFee?: number;
  penaltyAmount?: number;
  receiptNumber?: string;
  receiptGenerated?: boolean;
  invoiceNumber?: string;
  invoiceDate?: Date;
  invoicePdfUrl?: string;
  invoiceGenerated?: boolean;
  invoiceSentDate?: Date;
  notificationSent?: boolean;
  notificationSentDate?: Date;
  notificationMethod?: 'email' | 'sms' | 'manual';
  lastPaymentDate?: Date;
  receiptSent?: boolean;
  receiptSentDate?: Date;
  workflowCompletedDate?: Date;

  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  updatedBy?: string;
}

// Alias for compatibility
export type RentTransactionInput = CreateRentTransactionParams;
