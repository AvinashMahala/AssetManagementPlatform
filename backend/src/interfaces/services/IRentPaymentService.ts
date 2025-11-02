import { RentPayment, RentPaymentInput } from '../../models/RentPayment';

export interface IRentPaymentService {
  getAllPayments(): Promise<RentPayment[]>;
  getPaymentById(id: number): Promise<RentPayment | null>;
  getPaymentsByLease(leaseId: number): Promise<RentPayment[]>;
  getPaymentsByProperty(propertyId: number): Promise<RentPayment[]>;
  getPaymentsByTenant(tenantId: number): Promise<RentPayment[]>;
  getPendingPayments(): Promise<RentPayment[]>;
  getOverduePayments(): Promise<RentPayment[]>;
  getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]>;
  createPayment(paymentData: RentPaymentInput): Promise<RentPayment>;
  updatePayment(id: number, paymentData: Partial<RentPaymentInput>): Promise<RentPayment | null>;
  deletePayment(id: number): Promise<boolean>;
  markPaymentAsPaid(id: number, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;

  // Financial calculations
  calculateLateFees(amount: number, dueDate: Date, paidDate?: Date): number;
  generateMonthlyPayments(leaseId: number, startDate: Date, endDate: Date): Promise<RentPayment[]>;

  // Financial summaries
  getTotalRevenueByProperty(propertyId: number, startDate?: Date, endDate?: Date): Promise<number>;
  getTotalRevenueByOwner(ownerId: number, startDate?: Date, endDate?: Date): Promise<number>;
  getOutstandingPayments(): Promise<number>;
  getMonthlyRevenueReport(year: number, month: number): Promise<any>;
}