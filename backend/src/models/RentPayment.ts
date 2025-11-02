// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
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
  id: number;
  leaseId: number;
  propertyId: number;
  tenantId: number;

  // Payment details
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;

  // Payment method and reference
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;

  // Late fees and penalties
  lateFee?: number;
  penaltyAmount?: number;

  // Breakdown
  rentAmount: number;
  maintenanceCharges?: number;
  otherCharges?: {
    name: string;
    amount: number;
  }[];

  // Notes and comments
  notes?: string;

  // Tracking
  createdBy: number; // user ID who created the payment record
  updatedBy?: number; // user ID who last updated

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RentPaymentInput {
  leaseId: number;
  propertyId: number;
  tenantId: number;

  // Payment details
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status?: PaymentStatus;

  // Payment method and reference
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;

  // Late fees and penalties
  lateFee?: number;
  penaltyAmount?: number;

  // Breakdown
  rentAmount: number;
  maintenanceCharges?: number;
  otherCharges?: {
    name: string;
    amount: number;
  }[];

  // Notes
  notes?: string;

  // Tracking
  createdBy: number;
}