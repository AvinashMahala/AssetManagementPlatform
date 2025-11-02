import { RentPayment, RentPaymentInput } from '../../models/RentPayment';

export interface IRentPaymentService {
  getAllPayments(): Promise<RentPayment[]>;
  getPaymentById(id: string): Promise<RentPayment | null>;
  getPaymentsByLease(leaseId: string): Promise<RentPayment[]>;
  getPaymentsByProperty(propertyId: string): Promise<RentPayment[]>;
  getPaymentsByTenant(tenantId: string): Promise<RentPayment[]>;
  getPendingPayments(): Promise<RentPayment[]>;
  getOverduePayments(): Promise<RentPayment[]>;
  getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]>;
  createPayment(paymentData: RentPaymentInput): Promise<RentPayment>;
  updatePayment(id: string, paymentData: Partial<RentPaymentInput>): Promise<RentPayment | null>;
  deletePayment(id: string): Promise<boolean>;
  markPaymentAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;

  // Financial calculations
  calculateLateFees(amount: number, dueDate: Date, paidDate?: Date): number;
  generateMonthlyPayments(leaseId: string, startDate: Date, endDate: Date): Promise<RentPayment[]>;

  // Financial summaries
  getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getTotalRevenueByOwner(ownerId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getOutstandingPayments(): Promise<number>;
  getMonthlyRevenueReport(year: number, month: number): Promise<any>;
}