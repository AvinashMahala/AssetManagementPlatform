import { RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams } from './rent-transaction.types';

export interface IRentTransactionService {
  getAllTransactions(): Promise<RentTransaction[]>;
  getTransactionById(id: string): Promise<RentTransaction | null>;
  getTransactionsByLease(leaseId: string): Promise<RentTransaction[]>;
  getTransactionsByProperty(propertyId: string): Promise<RentTransaction[]>;
  getTransactionsByTenant(tenantId: string): Promise<RentTransaction[]>;
  getTransactionsByBillingPeriod(billingPeriodStart: Date, billingPeriodEnd: Date): Promise<RentTransaction[]>;
  getPendingTransactions(): Promise<RentTransaction[]>;
  getOverdueTransactions(): Promise<RentTransaction[]>;
  getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<RentTransaction[]>;
  getCurrentMonthTransaction(unitId: string): Promise<RentTransaction | null>;
  getUnitHistory(unitId: string, limit?: number): Promise<RentTransaction[]>;
  createTransaction(transactionData: CreateRentTransactionParams): Promise<RentTransaction>;
  updateTransaction(id: string, transactionData: UpdateRentTransactionParams): Promise<RentTransaction | null>;
  deleteTransaction(id: string): Promise<boolean>;
  markTransactionAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;
  recordPayment(transactionId: string, amountPaid: number, paymentMethod: string, paymentDate: Date, paymentReference?: string): Promise<RentTransaction | null>;
  getLastMeterReadings(unitId: string): Promise<any[]>;
  generateMonthlyTransactions(propertyId?: string, month?: number, year?: number): Promise<RentTransaction[]>;
  generateReceipt(transactionId: string): Promise<string>;
}
