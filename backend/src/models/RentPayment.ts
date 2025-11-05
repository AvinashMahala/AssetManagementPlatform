// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
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

export interface RentPayment {
  id: string; // UUID
  leaseId: string; // UUID reference to leases
  propertyId?: string; // UUID reference to properties (optional - not in current schema)
  tenantId: string; // UUID reference to tenants

  // Payment details
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;

  // Payment method and reference
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;

  // Fee calculations
  lateFee?: number;
  penaltyAmount?: number;

  // Amount breakdown
  rentAmount?: number; // Optional - not in current schema, using amount instead
  maintenanceCharges?: number;
  otherCharges?: number;

  // Notes and comments
  notes?: string;

  // Tracking
  createdBy: string; // UUID reference to users
  updatedBy?: string; // UUID reference to users

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RentPaymentInput {
  leaseId: string;
  propertyId?: string;
  tenantId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  lateFee?: number;
  penaltyAmount?: number;
  rentAmount?: number;
  maintenanceCharges?: number;
  otherCharges?: number;
  notes?: string;
  createdBy: string;
  updatedBy?: string;
}