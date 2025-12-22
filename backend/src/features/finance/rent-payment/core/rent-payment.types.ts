
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
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

export interface RentPayment {
  id: string;
  leaseId: string;
  propertyId?: string;
  tenantId: string;
  unitId?: string;
  unitNumber?: string;
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
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  nextPaymentDate?: Date;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRentPaymentParams {
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
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  nextPaymentDate?: Date;
  createdBy?: string;
}

export interface UpdateRentPaymentParams {
  amount?: number;
  dueDate?: Date;
  paidDate?: Date;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  paymentReference?: string;
  lateFee?: number;
  penaltyAmount?: number;
  rentAmount?: number;
  maintenanceCharges?: number;
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurringInterval?: string;
  nextPaymentDate?: Date;
  updatedBy?: string;
}

export interface RentPaymentFilters {
  leaseId?: string;
  propertyId?: string;
  tenantId?: string;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
}
