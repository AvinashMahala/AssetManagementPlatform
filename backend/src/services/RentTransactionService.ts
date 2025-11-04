import { IRentTransactionRepository } from '../interfaces/repositories/IRentTransactionRepository';
import { IRentTransactionService } from '../interfaces/services/IRentTransactionService';
import { RentTransaction, RentTransactionInput, RentTransactionStatus, BillingMethod, ExpenseAction } from '../models/RentTransaction';
import { ValidationUtils } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants/validation';
import { ILeaseRepository } from '../interfaces/repositories/ILeaseRepository';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository';

export class RentTransactionService implements IRentTransactionService {
  private repository: IRentTransactionRepository;
  private leaseRepository: ILeaseRepository;
  private propertyRepository: IPropertyRepository;
  private tenantRepository: ITenantRepository;

  constructor(
    repository: IRentTransactionRepository,
    leaseRepository: ILeaseRepository,
    propertyRepository: IPropertyRepository,
    tenantRepository: ITenantRepository
  ) {
    this.repository = repository;
    this.leaseRepository = leaseRepository;
    this.propertyRepository = propertyRepository;
    this.tenantRepository = tenantRepository;
  }

  async getAllTransactions(): Promise<RentTransaction[]> {
    return await this.repository.findAll();
  }

  async getTransactionById(id: string): Promise<RentTransaction | null> {
    if (!id) {
      throw new Error('Transaction ID is required');
    }
    return await this.repository.findById(id);
  }

  async getTransactionsByLease(leaseId: string): Promise<RentTransaction[]> {
    if (!leaseId) {
      throw new Error('Lease ID is required');
    }
    return await this.repository.findByLease(leaseId);
  }

  async getTransactionsByProperty(propertyId: string): Promise<RentTransaction[]> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    return await this.repository.findByProperty(propertyId);
  }

  async getTransactionsByTenant(tenantId: string): Promise<RentTransaction[]> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return await this.repository.findByTenant(tenantId);
  }

  async getTransactionsByBillingPeriod(billingPeriodStart: Date, billingPeriodEnd: Date): Promise<RentTransaction[]> {
    if (!billingPeriodStart || !billingPeriodEnd) {
      throw new Error('Billing period start and end dates are required');
    }
    if (billingPeriodStart > billingPeriodEnd) {
      throw new Error('Billing period start date cannot be after end date');
    }
    return await this.repository.findByBillingPeriod(billingPeriodStart, billingPeriodEnd);
  }

  async getPendingTransactions(): Promise<RentTransaction[]> {
    return await this.repository.findPendingTransactions();
  }

  async getOverdueTransactions(): Promise<RentTransaction[]> {
    return await this.repository.findOverdueTransactions();
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<RentTransaction[]> {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }
    return await this.repository.findTransactionsByDateRange(startDate, endDate);
  }

  async createTransaction(transactionData: RentTransactionInput): Promise<RentTransaction> {
    // Validate transaction data
    const validation = this.validateTransactionData(transactionData);
    if (!validation.isValid) {
      throw new Error(`Invalid transaction data: ${validation.errors.join(', ')}`);
    }

    // Verify lease exists
    const lease = await this.leaseRepository.findById(transactionData.leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }

    // Verify property exists
    const property = await this.propertyRepository.findById(transactionData.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Verify tenant exists
    const tenant = await this.tenantRepository.findById(transactionData.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Calculate total amount if not provided
    const totalAmount = transactionData.totalAmount ||
      (transactionData.baseRent + transactionData.previousBalance +
       transactionData.expenses.reduce((sum, expense) => sum + expense.amount, 0));

    // Calculate new balance
    const newBalance = totalAmount - (transactionData.amountPaid || 0);

    const transactionInput = {
      ...transactionData,
      totalAmount: totalAmount,
      newBalance: newBalance,
      status: transactionData.status || RentTransactionStatus.DRAFT
    } as RentTransactionInput;

    return await this.repository.create(transactionInput);
  }

  async updateTransaction(id: string, transactionData: Partial<RentTransactionInput>): Promise<RentTransaction | null> {
    if (!id) {
      throw new Error('Transaction ID is required');
    }

    // Check if transaction exists
    const existingTransaction = await this.repository.findById(id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    // Validate transaction data if provided
    if (Object.keys(transactionData).length > 0) {
      const validation = this.validateTransactionData(transactionData as RentTransactionInput, true);
      if (!validation.isValid) {
        throw new Error(`Invalid transaction data: ${validation.errors.join(', ')}`);
      }
    }

    // Recalculate amounts if components changed
    let updatedData = { ...transactionData };
    if (transactionData.baseRent !== undefined || transactionData.previousBalance !== undefined ||
        transactionData.expenses !== undefined || transactionData.amountPaid !== undefined) {
      const baseRent = transactionData.baseRent !== undefined ? transactionData.baseRent : existingTransaction.baseRent;
      const previousBalance = transactionData.previousBalance !== undefined ? transactionData.previousBalance : existingTransaction.previousBalance;
      const expenses = transactionData.expenses !== undefined ? transactionData.expenses : existingTransaction.expenses;
      const amountPaid = transactionData.amountPaid !== undefined ? transactionData.amountPaid : existingTransaction.amountPaid;

      const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      updatedData.totalAmount = baseRent + previousBalance + expenseTotal;
      updatedData.newBalance = updatedData.totalAmount - amountPaid;
    }

    return await this.repository.update(id, updatedData);
  }

  async deleteTransaction(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Transaction ID is required');
    }

    // Check if transaction exists
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Only allow deletion of draft transactions
    if (transaction.status !== RentTransactionStatus.DRAFT) {
      throw new Error('Only draft transactions can be deleted');
    }

    return await this.repository.delete(id);
  }

  async markTransactionAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean> {
    if (!id) {
      throw new Error('Transaction ID is required');
    }

    if (!paidDate) {
      throw new Error('Paid date is required');
    }

    // Check if transaction exists
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction with payment info and mark as paid
    await this.repository.update(id, {
      paidDate: paidDate,
      status: RentTransactionStatus.PAID,
      newBalance: 0
    });

    return await this.repository.markAsPaid(id, paidDate, paymentMethod, transactionId);
  }

  calculateLateFees(amount: number, dueDate: Date, paidDate?: Date): number {
    if (!dueDate) {
      throw new Error('Due date is required');
    }

    const paymentDate = paidDate || new Date();
    if (paymentDate <= dueDate) {
      return 0; // No late fee if paid on or before due date
    }

    // Calculate days late
    const daysLate = Math.ceil((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    // Simple late fee calculation: $50 per day (can be made configurable)
    const lateFeePerDay = 50;
    return daysLate * lateFeePerDay;
  }

  async generateMonthlyTransactions(leaseId: string, startDate: Date, endDate: Date): Promise<RentTransaction[]> {
    if (!leaseId) {
      throw new Error('Lease ID is required');
    }

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    // Get lease details
    const lease = await this.leaseRepository.findById(leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }

    const transactions: RentTransaction[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      // Calculate billing period (month start to month end)
      const billingPeriodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const billingPeriodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Skip if billing period end is after lease end date
      if (billingPeriodEnd > lease.endDate) {
        break;
      }

      // Calculate days in billing period
      const daysCount = Math.ceil((billingPeriodEnd.getTime() - billingPeriodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Calculate prorated rent if needed
      const monthlyRent = lease.monthlyRent;
      const baseRent = monthlyRent; // For now, assume full month

      // Get previous balance (simplified - would need more complex logic)
      const previousBalance = 0; // TODO: Calculate from previous transactions

      // Calculate expenses
      const expenses = [];
      if (lease.electricityCharges) {
        expenses.push({
          type: 'electricity',
          description: 'Electricity charges',
          amount: lease.electricityCharges,
          action: ExpenseAction.ADD
        });
      }
      if (lease.waterCharges) {
        expenses.push({
          type: 'water',
          description: 'Water charges',
          amount: lease.waterCharges,
          action: ExpenseAction.ADD
        });
      }
      if (lease.otherCharges) {
        expenses.push({
          type: 'other',
          description: 'Other charges',
          amount: lease.otherCharges,
          action: ExpenseAction.ADD
        });
      }

      const transactionInput: RentTransactionInput = {
        leaseId: lease.id,
        unitId: '', // TODO: Determine unit from lease or make optional
        propertyId: lease.propertyId,
        tenantId: lease.tenantId,
        billingPeriodStart: billingPeriodStart,
        billingPeriodEnd: billingPeriodEnd,
        billingMethod: BillingMethod.RELATIVE,
        daysCount: daysCount,
        baseRent: baseRent,
        previousBalance: previousBalance,
        expenses: expenses,
        totalAmount: baseRent + previousBalance + expenses.reduce((sum, expense) => sum + expense.amount, 0),
        amountPaid: 0,
        newBalance: baseRent + previousBalance + expenses.reduce((sum, expense) => sum + expense.amount, 0),
        status: RentTransactionStatus.DRAFT,
        receiptGenerated: false,
        createdBy: 'system' // This should be the current user ID
      };

      const transaction = await this.repository.create(transactionInput);
      transactions.push(transaction);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return transactions;
  }

  calculateTransactionTotal(transactionData: RentTransactionInput): number {
    const baseRent = transactionData.baseRent || 0;
    const previousBalance = transactionData.previousBalance || 0;
    const expensesTotal = transactionData.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    return baseRent + previousBalance + expensesTotal;
  }

  async getCurrentBalanceByLease(leaseId: string): Promise<number> {
    if (!leaseId) {
      throw new Error('Lease ID is required');
    }
    return await this.repository.getCurrentBalanceByLease(leaseId);
  }

  async getCurrentBalanceByTenant(tenantId: string): Promise<number> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return await this.repository.getCurrentBalanceByTenant(tenantId);
  }

  async getCurrentBalanceByProperty(propertyId: string): Promise<number> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    return await this.repository.getCurrentBalanceByProperty(propertyId);
  }

  async updateBalancesAfterPayment(transactionId: string): Promise<void> {
    // This would update balances for subsequent transactions
    // Implementation depends on business logic for balance carry-forward
    // For now, this is a placeholder
  }

  async getTotalRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<number> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    return await this.repository.getTotalRevenueByProperty(propertyId, startDate, endDate);
  }

  async getTotalRevenueByOwner(ownerId: string, startDate?: Date, endDate?: Date): Promise<number> {
    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    // Get all properties owned by this owner
    const properties = await this.propertyRepository.findByOwner(ownerId);
    const propertyIds = properties.map(p => p.id);

    if (propertyIds.length === 0) {
      return 0;
    }

    // Sum revenue from all properties
    let totalRevenue = 0;
    for (const propertyId of propertyIds) {
      totalRevenue += await this.repository.getTotalRevenueByProperty(propertyId, startDate, endDate);
    }

    return totalRevenue;
  }

  async getOutstandingTransactions(): Promise<number> {
    const pendingTransactions = await this.repository.findPendingTransactions();
    const overdueTransactions = await this.repository.findOverdueTransactions();

    const allOutstanding = [...pendingTransactions, ...overdueTransactions];
    return allOutstanding.reduce((total, transaction) => total + transaction.newBalance, 0);
  }

  async getMonthlyRevenueReport(year: number, month: number): Promise<any> {
    if (!year || !month) {
      throw new Error('Year and month are required');
    }

    if (month < 1 || month > 12) {
      throw new Error('Month must be between 1 and 12');
    }

    return await this.repository.getMonthlyRevenueReport(undefined, year, month);
  }

  private validateTransactionData(transactionData: RentTransactionInput, isPartial: boolean = false): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate required fields (skip for partial updates)
    if (!isPartial) {
      if (!transactionData.leaseId) {
        errors.push('Lease ID is required');
      }
      if (!transactionData.propertyId) {
        errors.push('Property ID is required');
      }
      if (!transactionData.tenantId) {
        errors.push('Tenant ID is required');
      }
      if (!transactionData.billingPeriodStart) {
        errors.push('Billing period start date is required');
      }
      if (!transactionData.billingPeriodEnd) {
        errors.push('Billing period end date is required');
      }
      if (!transactionData.createdBy) {
        errors.push('Created by is required');
      }
    }

    // Validate lease ID
    if (transactionData.leaseId !== undefined) {
      const leaseValidation = ValidationUtils.validateRentPaymentLeaseId(transactionData.leaseId);
      if (!leaseValidation.isValid) {
        errors.push(leaseValidation.message || 'Invalid lease ID');
      }
    }

    // Validate amounts
    if (transactionData.baseRent !== undefined) {
      const rentValidation = ValidationUtils.validateRentPaymentAmount(transactionData.baseRent);
      if (!rentValidation.isValid) {
        errors.push('Invalid base rent amount');
      }
    }

    if (transactionData.previousBalance !== undefined) {
      // Allow negative balances (credits)
      if (typeof transactionData.previousBalance !== 'number') {
        errors.push('Previous balance must be a number');
      }
    }

    if (transactionData.totalAmount !== undefined) {
      const totalValidation = ValidationUtils.validateRentPaymentAmount(transactionData.totalAmount);
      if (!totalValidation.isValid) {
        errors.push('Invalid total amount');
      }
    }

    if (transactionData.amountPaid !== undefined) {
      if (transactionData.amountPaid < 0) {
        errors.push('Amount paid cannot be negative');
      }
    }

    // Validate billing period
    if (transactionData.billingPeriodStart !== undefined && transactionData.billingPeriodEnd !== undefined) {
      if (transactionData.billingPeriodStart > transactionData.billingPeriodEnd) {
        errors.push('Billing period start date cannot be after end date');
      }
    }

    // Validate expenses
    if (transactionData.expenses !== undefined) {
      for (const expense of transactionData.expenses) {
        if (!expense.type || !expense.description) {
          errors.push('Expense type and description are required');
        }
        if (typeof expense.amount !== 'number' || expense.amount < 0) {
          errors.push('Expense amount must be a non-negative number');
        }
        if (!Object.values(ExpenseAction).includes(expense.action)) {
          errors.push('Invalid expense action');
        }
      }
    }

    // Validate status
    if (transactionData.status !== undefined && !Object.values(RentTransactionStatus).includes(transactionData.status)) {
      errors.push('Invalid transaction status');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}