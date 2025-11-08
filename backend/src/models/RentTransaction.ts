// Rent transaction status
export enum RentTransactionStatus {
  DRAFT = 'draft',
  FINALIZED = 'finalized',
  PAID = 'paid',
  CANCELLED = 'cancelled'
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
  previousBalance: number; // Can be negative (advance) or positive (owed)
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

  // Receipt
  receiptNumber?: string;
  receiptGenerated: boolean;

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
  previousBalance: number;
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
  receiptNumber?: string;
  receiptGenerated: boolean;
  notes?: string;
  createdBy: string;
  updatedBy?: string;
}
