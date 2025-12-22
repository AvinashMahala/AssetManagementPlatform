
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

export interface RentTransaction {
  id: string;
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
  totalAmount: number;
  amountPaid: number;
  newBalance: number;
  paidDate?: Date;
  status: RentTransactionStatus;
  workflowStatus: RentCollectionWorkflowStatus;
  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  createdBy?: string;
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
  totalAmount: number;
  amountPaid: number;
  newBalance: number;
  paidDate?: Date;
  status: RentTransactionStatus;
  workflowStatus: RentCollectionWorkflowStatus;
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
  invoiceUrl?: string;
  receiptUrl?: string;
  notes?: string;
  updatedBy?: string;
}
