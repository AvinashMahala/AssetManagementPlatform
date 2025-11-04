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

// Expense line item
export interface ExpenseLineItem {
  type: string; // Expense type (wifi_internet, food_meals, etc.)
  description: string;
  amount: number;
  action: ExpenseAction;
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
  totalAmount: number;
  amountPaid: number;
  newBalance: number;
  paidDate?: Date;
  status: RentTransactionStatus;
  receiptNumber?: string;
  receiptGenerated: boolean;
  notes?: string;
  createdBy: string;
  updatedBy?: string;
}