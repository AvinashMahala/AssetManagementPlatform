import { RentPayment, RentPaymentInput } from '../../models/RentPayment';

export interface IRentPaymentRepository {
  findAll(): Promise<RentPayment[]>;
  findById(id: number): Promise<RentPayment | null>;
  findByLease(leaseId: number): Promise<RentPayment[]>;
  findByProperty(propertyId: number): Promise<RentPayment[]>;
  findByTenant(tenantId: number): Promise<RentPayment[]>;
  findPendingPayments(): Promise<RentPayment[]>;
  findOverduePayments(): Promise<RentPayment[]>;
  findPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]>;
  create(data: Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentPayment>;
  update(id: number, data: Partial<Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RentPayment | null>;
  delete(id: number): Promise<boolean>;
  markAsPaid(id: number, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;

  // Financial summaries
  getTotalRevenueByProperty(propertyId: number, startDate?: Date, endDate?: Date): Promise<number>;
  getTotalRevenueByOwner(ownerId: number, startDate?: Date, endDate?: Date): Promise<number>;
  getOutstandingPayments(): Promise<number>;
}