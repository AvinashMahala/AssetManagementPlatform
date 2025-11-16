import { RentTransaction, RentTransactionInput } from '../../models/RentTransaction';

export interface IRentTransactionRepository {
  findAll(): Promise<RentTransaction[]>;
  findById(id: string): Promise<RentTransaction | null>;
  findByLease(leaseId: string): Promise<RentTransaction[]>;
  findByUnit(unitId: string): Promise<RentTransaction[]>;
  findByProperty(propertyId: string): Promise<RentTransaction[]>;
  findByTenant(tenantId: string): Promise<RentTransaction[]>;
  findByBillingPeriod(billingPeriodStart: Date, billingPeriodEnd: Date): Promise<RentTransaction[]>;
  findByPropertyAndPeriod(propertyId: string, month: number, year: number): Promise<RentTransaction[]>;
  findPendingTransactions(): Promise<RentTransaction[]>;
  findOverdueTransactions(): Promise<RentTransaction[]>;
  findTransactionsByDateRange(startDate: Date, endDate: Date): Promise<RentTransaction[]>;
  findTransactionsByStatus(status: string): Promise<RentTransaction[]>;
  create(data: Omit<RentTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentTransaction>;
  update(id: string, data: Partial<Omit<RentTransaction, 'id' | 'createdAt' | 'updatedAt'>>): Promise<RentTransaction | null>;
  delete(id: string): Promise<boolean>;
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