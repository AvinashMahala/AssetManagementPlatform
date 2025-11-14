export const PaymentStatus = { PAID: 'paid', PENDING: 'pending', OVERDUE: 'overdue', PARTIAL: 'partial' } as const;
export type PaymentStatusValue = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentMethod = { CASH: 'cash', BANK_TRANSFER: 'bank_transfer', UPI: 'upi', CHEQUE: 'cheque', CARD: 'card' } as const;
export type PaymentMethodValue = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface RentPayment {
  id: string;
  leaseId: string;
  tenantId: string;
  propertyId?: string;
  unitId?: string;
  unitNumber?: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatusValue;
  paymentMethod?: PaymentMethodValue;
  transactionId?: string;
  paymentReference?: string;
  lateFee?: number;
  penaltyAmount?: number;
  rentAmount?: number;
  maintenanceCharges?: number;
  otherCharges?: number;
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentPaymentInput {
  leaseId: string;
  tenantId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethodValue;
  transactionId?: string;
  paymentReference?: string;
  lateFee?: number;
  penaltyAmount?: number;
  rentAmount?: number;
  maintenanceCharges?: number;
  otherCharges?: number;
  notes?: string;
  createdBy?: string;
}
