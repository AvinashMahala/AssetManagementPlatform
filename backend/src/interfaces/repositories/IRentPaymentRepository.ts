import { RentPayment, RentPaymentInput } from '../../models/RentPayment';

export interface IRentPaymentRepository {
  findAll(): Promise<RentPayment[]>;
  findById(id: string): Promise<RentPayment | null>;
  findByLease(leaseId: string): Promise<RentPayment[]>;
  findByProperty(propertyId: string): Promise<RentPayment[]>;
  findByTenant(tenantId: string): Promise<RentPayment[]>;
  findPendingPayments(): Promise<RentPayment[]>;
  findOverduePayments(): Promise<RentPayment[]>;
  findPartialPayments(): Promise<RentPayment[]>;
  findPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]>;
  findPaymentsByStatus(status: string): Promise<RentPayment[]>;
  create(data: Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentPayment>;
  update(id: string, data: Partial<Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RentPayment | null>;
  delete(id: string): Promise<boolean>;
  markAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;
  markAsOverdue(id: string): Promise<boolean>;
  calculateLateFees(id: string): Promise<number>;

  // Financial summaries
  getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getTotalRevenueByLease(leaseId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getOutstandingPaymentsByProperty(propertyId: string): Promise<number>;
  getOutstandingPaymentsByTenant(tenantId: string): Promise<number>;
  getMonthlyRevenueReport(propertyId?: string, year?: number, month?: number): Promise<any>;
  getPaymentStatistics(startDate?: Date, endDate?: Date): Promise<any>;
}