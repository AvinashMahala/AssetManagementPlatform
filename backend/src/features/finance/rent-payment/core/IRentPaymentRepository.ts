
import { IBaseRepository } from '@/shared/infrastructure/database/IBaseRepository';
import { RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams, RentPaymentFilters } from './rent-payment.types';

export interface IRentPaymentRepository extends IBaseRepository<RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams> {
  create(data: CreateRentPaymentParams): Promise<RentPayment>;
  update(id: string, data: UpdateRentPaymentParams): Promise<RentPayment | null>;
  findByLease(leaseId: string): Promise<RentPayment[]>;
  findByProperty(propertyId: string): Promise<RentPayment[]>;
  findByTenant(tenantId: string): Promise<RentPayment[]>;
  findByTransaction(transactionId: string): Promise<RentPayment[]>;
  findPendingPayments(): Promise<RentPayment[]>;
  findOverduePayments(): Promise<RentPayment[]>;
  findPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]>;
  
  // Legacy methods
  findPartialPayments(): Promise<RentPayment[]>;
  findPaymentsByStatus(status: string): Promise<RentPayment[]>;
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
