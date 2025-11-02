// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

// Payment method
export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  UPI = 'upi',
  CHEQUE = 'cheque',
  PAYTM = 'paytm',
  PHONEPE = 'phonepe',
  AMAZON_PAY = 'amazon_pay',
  OTHER = 'other'
}

export interface RentPayment {
  id: string; // UUID
  leaseId: string; // UUID reference to leases
  tenantId: string; // UUID reference to tenants

  // Payment details
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;

  // Payment method and reference
  paymentMethod?: PaymentMethod;
  transactionId?: string;

  // Notes and comments
  notes?: string;

  // Tracking
  createdBy: string; // UUID reference to users

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RentPaymentInput {
  leaseId: string;
  tenantId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  notes?: string;
  createdBy: string;
}