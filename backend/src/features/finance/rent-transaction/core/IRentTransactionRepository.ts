
import { IBaseRepository } from '@/shared/infrastructure/database/IBaseRepository';
import { RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams } from './rent-transaction.types';

export interface IRentTransactionRepository extends IBaseRepository<RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams> {
  create(data: CreateRentTransactionParams): Promise<RentTransaction>;
  update(id: string, data: UpdateRentTransactionParams): Promise<RentTransaction | null>;
  findByLease(leaseId: string): Promise<RentTransaction[]>;
  findByProperty(propertyId: string): Promise<RentTransaction[]>;
  findByTenant(tenantId: string): Promise<RentTransaction[]>;
  findByUnit(unitId: string): Promise<RentTransaction[]>;
  findByBillingPeriod(start: Date, end: Date): Promise<RentTransaction[]>;
  findPendingTransactions(): Promise<RentTransaction[]>;
  findOverdueTransactions(): Promise<RentTransaction[]>;
  findTransactionsByDateRange(start: Date, end: Date): Promise<RentTransaction[]>;
  
  // Legacy methods
  findByPropertyAndPeriod(propertyId: string, month: number, year: number): Promise<RentTransaction[]>;
  findTransactionsByStatus(status: string): Promise<RentTransaction[]>;
  markAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;
  markAsOverdue(id: string): Promise<boolean>;
  calculateLateFees(id: string): Promise<number>;

  // Financial summaries
  getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getTotalRevenueByLease(leaseId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getOutstandingTransactionsByProperty(propertyId: string): Promise<number>;
  getOutstandingTransactionsByTenant(tenantId: string): Promise<number>;
  getMonthlyRevenueReport(propertyId?: string, year?: number, month?: number): Promise<any>;
  getTransactionStatistics(startDate?: Date, endDate?: Date): Promise<any>;

  // Balance tracking
  getCurrentBalanceByLease(leaseId: string): Promise<number>;
  getCurrentBalanceByTenant(tenantId: string): Promise<number>;
  getCurrentBalanceByProperty(propertyId: string): Promise<number>;
}
