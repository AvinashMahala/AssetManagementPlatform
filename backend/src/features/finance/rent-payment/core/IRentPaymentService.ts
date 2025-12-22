import { RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams } from './rent-payment.types';

export interface IRentPaymentService {
  getAllPayments(): Promise<RentPayment[]>;
  getPaymentById(id: string): Promise<RentPayment | null>;
  getPaymentsByLease(leaseId: string): Promise<RentPayment[]>;
  getPaymentsByProperty(propertyId: string): Promise<RentPayment[]>;
  getPaymentsByTenant(tenantId: string): Promise<RentPayment[]>;
  getPendingPayments(): Promise<RentPayment[]>;
  getOverduePayments(): Promise<RentPayment[]>;
  getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]>;
  createPayment(paymentData: CreateRentPaymentParams): Promise<RentPayment>;
  updatePayment(id: string, paymentData: UpdateRentPaymentParams): Promise<RentPayment | null>;
  deletePayment(id: string): Promise<boolean>;
  deletePayments(ids: string[]): Promise<{ deleted: number; failed: string[] }>;
  markPaymentAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;

  // Financial calculations
  calculateLateFees(amount: number, dueDate: Date, paidDate?: Date): number;
  generateMonthlyPayments(leaseId: string, startDate: Date, endDate: Date): Promise<RentPayment[]>;
}
