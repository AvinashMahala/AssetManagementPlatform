import { RentTransaction, RentTransactionInput } from '../../models/RentTransaction';

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
  createTransaction(transactionData: RentTransactionInput): Promise<RentTransaction>;
  updateTransaction(id: string, transactionData: Partial<RentTransactionInput>): Promise<RentTransaction | null>;
  deleteTransaction(id: string): Promise<boolean>;
  markTransactionAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean>;
  recordPayment(transactionId: string, amountPaid: number, paymentMethod: string, paymentDate: Date, paymentReference?: string): Promise<RentTransaction | null>;
  getLastMeterReadings(unitId: string): Promise<any[]>;
  generateInvoice(transactionId: string): Promise<{ pdfUrl: string; invoiceNumber: string }>;
  generateReceipt(transactionId: string): Promise<{ pdfUrl: string; receiptNumber: string }>;
  getMonthlySummary(propertyId: string, year: number, month: number): Promise<any>;

  // Financial calculations
  calculateLateFees(amount: number, dueDate: Date, paidDate?: Date): number;
  generateMonthlyTransactions(leaseId: string, startDate: Date, endDate: Date): Promise<RentTransaction[]>;
  calculateTransactionTotal(transactionData: RentTransactionInput): number;

  // Balance tracking
  getCurrentBalanceByLease(leaseId: string): Promise<number>;
  getCurrentBalanceByTenant(tenantId: string): Promise<number>;
  getCurrentBalanceByProperty(propertyId: string): Promise<number>;
  updateBalancesAfterPayment(transactionId: string): Promise<void>;

  // Financial summaries
  getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getTotalRevenueByOwner(ownerId: string, startDate?: Date, endDate?: Date): Promise<number>;
  getOutstandingTransactions(): Promise<number>;
  getMonthlyRevenueReport(year: number, month: number): Promise<any>;
}