import { IRentTransactionRepository } from '../interfaces/repositories/IRentTransactionRepository';
import { IRentTransactionService } from '../interfaces/services/IRentTransactionService';
import { RentTransaction, RentTransactionInput, RentTransactionStatus, BillingMethod, ExpenseAction, RentCollectionWorkflowStatus } from '../models/RentTransaction';
import { ValidationUtils } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants/validation';
import { ILeaseRepository } from '../interfaces/repositories/ILeaseRepository';
import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository';
import { IMeterRepository, IMeterReadingRepository } from '../interfaces/repositories/IMeterRepository';
import { IReceiptService } from '../interfaces/repositories/IReceiptRepository';
import { IRentTransactionMeterReadingRepository } from '../repositories/RentTransactionMeterReadingRepository';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { IUnitUtilityService } from '../interfaces/services/IUnitUtilityService';
import { PDFGenerator } from '../utils/pdfGenerator';
import { ReceiptData } from '../models/Receipt';
import { notificationService } from './NotificationService';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RentTransactionService implements IRentTransactionService {
  private repository: IRentTransactionRepository;
  private leaseRepository: ILeaseRepository;
  private propertyRepository: IPropertyRepository;
  private tenantRepository: ITenantRepository;
  private meterRepository: IMeterRepository;
  private meterReadingRepository: IMeterReadingRepository;
  private receiptService: IReceiptService;
  private transactionMeterReadingRepository: IRentTransactionMeterReadingRepository;
  private userRepository: IUserRepository;
  private unitUtilityService: IUnitUtilityService;

  constructor(
    repository: IRentTransactionRepository,
    leaseRepository: ILeaseRepository,
    propertyRepository: IPropertyRepository,
    tenantRepository: ITenantRepository,
    meterRepository: IMeterRepository,
    meterReadingRepository: IMeterReadingRepository,
    receiptService: IReceiptService,
    transactionMeterReadingRepository: IRentTransactionMeterReadingRepository,
    userRepository: IUserRepository,
    unitUtilityService: IUnitUtilityService
  ) {
    this.repository = repository;
    this.leaseRepository = leaseRepository;
    this.propertyRepository = propertyRepository;
    this.tenantRepository = tenantRepository;
    this.meterRepository = meterRepository;
    this.meterReadingRepository = meterReadingRepository;
    this.receiptService = receiptService;
    this.transactionMeterReadingRepository = transactionMeterReadingRepository;
    this.userRepository = userRepository;
    this.unitUtilityService = unitUtilityService;
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

  async getUnitHistory(unitId: string, limit?: number): Promise<RentTransaction[]> {
    if (!unitId) {
      throw new Error('Unit ID is required');
    }
    
    const transactions = await this.repository.findByUnit(unitId);
    
    // Sort by billing period start date descending (most recent first)
    transactions.sort((a, b) => b.billingPeriodStart.getTime() - a.billingPeriodStart.getTime());
    
    // Apply limit if specified, default to 5
    const maxResults = limit || 5;
    return transactions.slice(0, maxResults);
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
      status: transactionData.status || RentTransactionStatus.DRAFT,
      workflowStatus: RentCollectionWorkflowStatus.INVOICE_PENDING,
      invoiceGenerated: false,
      notificationSent: false,
      receiptSent: false
    } as Omit<RentTransaction, 'id' | 'createdAt' | 'updatedAt'>;

    // Create the transaction
    const transaction = await this.repository.create(transactionInput);

    // If meter readings are provided, save them to the junction table
    if (transactionData.meterReadings && transactionData.meterReadings.length > 0) {
      try {
        const meterReadingInputs = transactionData.meterReadings.map(mr => ({
          transactionId: transaction.id,
          meterId: mr.meterId,
          meterReadingId: mr.meterReadingId,
          previousReading: mr.previousReading,
          currentReading: mr.currentReading,
          unitsConsumed: mr.unitsConsumed,
          costPerUnit: mr.costPerUnit,
          fixedCharge: mr.fixedCharge || 0,
          totalCost: mr.totalCost
        }));

        await this.transactionMeterReadingRepository.createBatch(meterReadingInputs);
      } catch (error) {
        console.error('Error saving meter readings:', error);
        // Continue - don't fail transaction creation if meter readings fail
      }
    }

    return transaction;
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

    // Allow deletion of all transaction types (business decision)
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

    if (!lease.unitId) {
      throw new Error('Lease must be associated with a unit to calculate utility charges');
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

      // Calculate utility charges from unit utilities
      const utilityCharges = await this.calculateUnitUtilityCharges(lease.unitId, billingPeriodStart, billingPeriodEnd);

      // Calculate expenses (legacy charges from lease + utility charges)
      const expenses = [];

      // Add legacy charges from lease (for backward compatibility)
      if (lease.electricityCharges) {
        expenses.push({
          type: 'electricity',
          description: 'Electricity charges (legacy)',
          amount: lease.electricityCharges,
          action: ExpenseAction.ADD
        });
      }
      if (lease.waterCharges) {
        expenses.push({
          type: 'water',
          description: 'Water charges (legacy)',
          amount: lease.waterCharges,
          action: ExpenseAction.ADD
        });
      }
      if (lease.otherCharges) {
        expenses.push({
          type: 'other',
          description: 'Other charges (legacy)',
          amount: lease.otherCharges,
          action: ExpenseAction.ADD
        });
      }

      // Add utility charges from unit utilities system
      utilityCharges.forEach((utility: any) => {
        expenses.push({
          type: utility.utilityType,
          description: `${utility.utilityName} (${utility.billingMethod === 'meter_based' ? 'Meter-based' : 'Fixed'})`,
          amount: utility.amount,
          action: ExpenseAction.ADD
        });
      });

      const transactionInput: RentTransactionInput = {
        leaseId: lease.id,
        unitId: lease.unitId,
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
        workflowStatus: RentCollectionWorkflowStatus.INVOICE_PENDING,
        invoiceGenerated: false,
        notificationSent: false,
        receiptSent: false,
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

  /**
   * Get utility revenue breakdown by property
   */
  async getUtilityRevenueByProperty(propertyId: string, startDate?: Date, endDate?: Date): Promise<any> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    const transactions = await this.repository.findTransactionsByDateRange(
      startDate || new Date(new Date().getFullYear(), 0, 1),
      endDate || new Date()
    );

    // Filter by property
    const propertyTransactions = transactions.filter(t => t.propertyId === propertyId);

    // Aggregate utility charges
    const utilityRevenue: { [key: string]: number } = {};
    let totalUtilityRevenue = 0;

    for (const transaction of propertyTransactions) {
      if (transaction.expenses) {
        for (const expense of transaction.expenses) {
          // Check if this is a utility expense (based on type)
          if (['electricity', 'water', 'gas', 'internet', 'maintenance', 'parking', 'other'].includes(expense.type)) {
            utilityRevenue[expense.type] = (utilityRevenue[expense.type] || 0) + expense.amount;
            totalUtilityRevenue += expense.amount;
          }
        }
      }
    }

    return {
      propertyId,
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      },
      utilityRevenue,
      totalUtilityRevenue,
      transactionCount: propertyTransactions.length
    };
  }

  /**
   * Get utility revenue breakdown by unit
   */
  async getUtilityRevenueByUnit(unitId: string, startDate?: Date, endDate?: Date): Promise<any> {
    if (!unitId) {
      throw new Error('Unit ID is required');
    }

    const transactions = await this.repository.findTransactionsByDateRange(
      startDate || new Date(new Date().getFullYear(), 0, 1),
      endDate || new Date()
    );

    // Filter by unit
    const unitTransactions = transactions.filter(t => t.unitId === unitId);

    // Aggregate utility charges
    const utilityRevenue: { [key: string]: number } = {};
    let totalUtilityRevenue = 0;

    for (const transaction of unitTransactions) {
      if (transaction.expenses) {
        for (const expense of transaction.expenses) {
          // Check if this is a utility expense (based on type)
          if (['electricity', 'water', 'gas', 'internet', 'maintenance', 'parking', 'other'].includes(expense.type)) {
            utilityRevenue[expense.type] = (utilityRevenue[expense.type] || 0) + expense.amount;
            totalUtilityRevenue += expense.amount;
          }
        }
      }
    }

    return {
      unitId,
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      },
      utilityRevenue,
      totalUtilityRevenue,
      transactionCount: unitTransactions.length
    };
  }

  /**
   * Get overall utility revenue summary
   */
  async getUtilityRevenueSummary(propertyId?: string, startDate?: Date, endDate?: Date): Promise<any> {
    let transactions: RentTransaction[];

    if (propertyId) {
      transactions = await this.repository.findTransactionsByDateRange(
        startDate || new Date(new Date().getFullYear(), 0, 1),
        endDate || new Date()
      );
      transactions = transactions.filter(t => t.propertyId === propertyId);
    } else {
      transactions = await this.repository.findTransactionsByDateRange(
        startDate || new Date(new Date().getFullYear(), 0, 1),
        endDate || new Date()
      );
    }

    // Aggregate utility charges by type and property
    const utilityRevenueByType: { [key: string]: number } = {};
    const utilityRevenueByProperty: { [key: string]: { [key: string]: number } } = {};
    let totalUtilityRevenue = 0;

    for (const transaction of transactions) {
      if (transaction.expenses) {
        for (const expense of transaction.expenses) {
          // Check if this is a utility expense (based on type)
          if (['electricity', 'water', 'gas', 'internet', 'maintenance', 'parking', 'other'].includes(expense.type)) {
            // By type
            utilityRevenueByType[expense.type] = (utilityRevenueByType[expense.type] || 0) + expense.amount;

            // By property
            if (!utilityRevenueByProperty[transaction.propertyId]) {
              utilityRevenueByProperty[transaction.propertyId] = {};
            }
            utilityRevenueByProperty[transaction.propertyId][expense.type] =
              (utilityRevenueByProperty[transaction.propertyId][expense.type] || 0) + expense.amount;

            totalUtilityRevenue += expense.amount;
          }
        }
      }
    }

    return {
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      },
      propertyId: propertyId || null,
      utilityRevenueByType,
      utilityRevenueByProperty,
      totalUtilityRevenue,
      transactionCount: transactions.length
    };
  }

  async getCurrentMonthTransaction(unitId: string): Promise<RentTransaction | null> {
    if (!unitId) {
      throw new Error('Unit ID is required');
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-11
    
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Find transaction for this unit in current month
    const transactions = await this.repository.findByBillingPeriod(startDate, endDate);
    const unitTransactions = transactions.filter(t => t.unitId === unitId);
    
    return unitTransactions.length > 0 ? unitTransactions[0] : null;
  }

  async getLastMeterReadings(unitId: string): Promise<any[]> {
    if (!unitId) {
      throw new Error('Unit ID is required');
    }

    try {
      // Get all meters for the unit
      const meters = await this.meterRepository.findByUnit(unitId);
      
      if (meters.length === 0) {
        return [];
      }

      // Get latest reading for each meter
      const readingsPromises = meters.map(async (meter) => {
        const latestReading = await this.meterReadingRepository.findLatestByMeter(meter.id);
        
        return {
          meterId: meter.id,
          meterType: meter.meterType,
          meterName: meter.meterName,
          meterNumber: meter.meterNumber,
          previousReading: latestReading?.currentReading || 0,
          currentReading: 0 // To be filled by user
        };
      });

      const readings = await Promise.all(readingsPromises);
      return readings.filter(r => r !== null);
    } catch (error) {
      console.error('Error fetching last meter readings:', error);
      throw new Error(`Failed to fetch last meter readings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async recordPayment(
    transactionId: string,
    amountPaid: number,
    paymentMethod: string,
    paymentDate: Date,
    paymentReference?: string
  ): Promise<RentTransaction | null> {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    if (amountPaid <= 0) {
      throw new Error('Amount paid must be greater than 0');
    }

    const transaction = await this.repository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Calculate new balances
    const totalPaid = transaction.amountPaid + amountPaid;
    const newBalance = transaction.totalAmount - totalPaid;

    // Determine new status
    let newStatus = transaction.status;
    let newWorkflowStatus = transaction.workflowStatus;

    if (newBalance <= 0) {
      newStatus = RentTransactionStatus.PAID;
      newWorkflowStatus = RentCollectionWorkflowStatus.PAYMENT_COMPLETED;
    } else if (totalPaid > 0 && newBalance > 0) {
      newStatus = RentTransactionStatus.FINALIZED; // Partial payment
      newWorkflowStatus = RentCollectionWorkflowStatus.PAYMENT_PARTIAL;
    }

    // Update transaction with workflow tracking
    return await this.repository.update(transactionId, {
      amountPaid: totalPaid,
      newBalance: newBalance,
      paidDate: newBalance <= 0 ? paymentDate : transaction.paidDate,
      status: newStatus,
      paymentMethod: paymentMethod as any,
      paymentReference: paymentReference,
      workflowStatus: newWorkflowStatus,
      lastPaymentDate: paymentDate,
      updatedBy: transaction.createdBy // TODO: Get from current user context
    });
  }

  async generateInvoice(transactionId: string): Promise<{ pdfUrl: string; invoiceNumber: string }> {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const transaction = await this.repository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Get related data for invoice generation
    const lease = await this.leaseRepository.findById(transaction.leaseId);
    if (!lease) {
      throw new Error('Lease not found for transaction');
    }

    const property = await this.propertyRepository.findById(transaction.propertyId);
    if (!property) {
      throw new Error('Property not found for transaction');
    }

    const tenant = await this.tenantRepository.findById(transaction.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found for transaction');
    }

    // Get property owner (landlord) details
    const landlord = await this.userRepository.findById(property.ownerId);

    // Generate invoice number if not exists
    const invoiceNumber = transaction.invoiceNumber || this.generateInvoiceNumber();

    // Build receipt data structure for invoice (unpaid)
    const receiptData: ReceiptData = {
      // Property information
      property: {
        name: property.name,
        address: property.address ? `${property.address.street}, ${property.address.city}, ${property.address.state} - ${property.address.pincode}` : '',
        phone: property.ownerDetails?.mobileNumbers?.[0] || '',
        email: property.ownerDetails?.emailIds?.[0] || '',
        currency: property.currency || 'INR'
      },

      // Landlord information
      landlord: {
        name: landlord?.name || 'Property Owner',
        phone: landlord?.phone || '',
        email: landlord?.email || ''
      },

      // Tenant information
      tenant: {
        name: `${tenant.firstName} ${tenant.lastName}`,
        phone: tenant.phone || '',
        email: tenant.email || '',
        address: tenant.currentAddress
          ? `${tenant.currentAddress.street}, ${tenant.currentAddress.city}, ${tenant.currentAddress.state} - ${tenant.currentAddress.pincode}`
          : ''
      },

      // Receipt details
      receiptNumber: invoiceNumber,
      receiptDate: new Date().toISOString(),
      period: {
        from: transaction.billingPeriodStart.toISOString(),
        to: transaction.billingPeriodEnd.toISOString()
      },

      // Financial breakdown
      breakdown: {
        baseRent: transaction.baseRent,
        previousBalance: transaction.previousBalance,
        expenses: transaction.expenses || [],
        totalAmount: transaction.totalAmount,
        amountPaid: transaction.amountPaid || 0,
        newBalance: transaction.newBalance
      },

      // Payment information (empty for invoice)
      payment: {
        method: undefined,
        transactionId: undefined,
        paidDate: undefined
      },

      // Receipt settings (basic)
      settings: {
        logoUrl: undefined,
        bankDetails: undefined,
        wallets: undefined,
        upiId: undefined,
        qrCodeUrl: undefined,
        signatureUrl: undefined,
        watermarkUrl: undefined
      },

      // Additional notes
      notes: transaction.notes || '',
      termsAndConditions: 'Payment is due within 30 days.',

      // Watermark settings
      watermarkText: 'UNPAID',
      isInvoice: true
    };

    // Generate PDF
    const pdfBuffer = await PDFGenerator.generateReceiptPDF(receiptData, null, true);

    // Save PDF to file system
    const pdfDir = path.join(__dirname, '../../public/invoices');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFileName = `${invoiceNumber}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Update transaction with invoice details
    await this.repository.update(transactionId, {
      invoiceNumber,
      invoiceGenerated: true,
      invoicePdfUrl: `/invoices/${pdfFileName}`
    });

    return {
      pdfUrl: `/invoices/${pdfFileName}`,
      invoiceNumber
    };
  }

  async generateReceipt(transactionId: string): Promise<{ pdfUrl: string; receiptNumber: string }> {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const transaction = await this.repository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== RentTransactionStatus.PAID) {
      throw new Error('Cannot generate receipt for unpaid transaction');
    }

    // Get related data for receipt generation
    const lease = await this.leaseRepository.findById(transaction.leaseId);
    if (!lease) {
      throw new Error('Lease not found for transaction');
    }

    const property = await this.propertyRepository.findById(transaction.propertyId);
    if (!property) {
      throw new Error('Property not found for transaction');
    }

    const tenant = await this.tenantRepository.findById(transaction.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found for transaction');
    }

    // Get property owner (landlord) details
    const landlord = await this.userRepository.findById(property.ownerId);

    // Generate receipt number if not exists
    const receiptNumber = transaction.receiptNumber || this.generateReceiptNumber();

    // Build receipt data structure for receipt (paid)
    const receiptData: ReceiptData = {
      // Property information
      property: {
        name: property.name,
        address: property.address ? `${property.address.street}, ${property.address.city}, ${property.address.state} - ${property.address.pincode}` : '',
        phone: property.ownerDetails?.mobileNumbers?.[0] || '',
        email: property.ownerDetails?.emailIds?.[0] || '',
        currency: property.currency || 'INR'
      },

      // Landlord information
      landlord: {
        name: landlord?.name || 'Property Owner',
        phone: landlord?.phone || '',
        email: landlord?.email || ''
      },

      // Tenant information
      tenant: {
        name: `${tenant.firstName} ${tenant.lastName}`,
        phone: tenant.phone || '',
        email: tenant.email || '',
        address: tenant.currentAddress
          ? `${tenant.currentAddress.street}, ${tenant.currentAddress.city}, ${tenant.currentAddress.state} - ${tenant.currentAddress.pincode}`
          : ''
      },

      // Receipt details
      receiptNumber: receiptNumber,
      receiptDate: (transaction.paidDate || new Date()).toISOString(),
      period: {
        from: transaction.billingPeriodStart.toISOString(),
        to: transaction.billingPeriodEnd.toISOString()
      },

      // Financial breakdown (what was paid)
      breakdown: {
        baseRent: transaction.amountPaid || 0,
        previousBalance: 0,
        expenses: [],
        totalAmount: transaction.amountPaid || 0,
        amountPaid: transaction.amountPaid || 0,
        newBalance: 0
      },

      // Payment information
      payment: {
        method: transaction.paymentMethod || 'Unknown',
        transactionId: transaction.transactionId || undefined,
        paidDate: (transaction.paidDate || new Date()).toISOString()
      },

      // Receipt settings (basic)
      settings: {
        logoUrl: undefined,
        bankDetails: undefined,
        wallets: undefined,
        upiId: undefined,
        qrCodeUrl: undefined,
        signatureUrl: undefined,
        watermarkUrl: undefined
      },

      // Additional notes
      notes: transaction.notes || 'Payment received with thanks',
      termsAndConditions: '',

      // Watermark settings
      watermarkText: 'PAID',
      isInvoice: false
    };

    // Generate PDF
    const pdfBuffer = await PDFGenerator.generateReceiptPDF(receiptData, null, false);

    // Save PDF to file system
    const pdfDir = path.join(__dirname, '../../public/receipts');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfFileName = `${receiptNumber}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Update transaction with receipt details
    await this.repository.update(transactionId, {
      receiptNumber,
      receiptGenerated: true
    });

    return {
      pdfUrl: `/receipts/${pdfFileName}`,
      receiptNumber
    };
  }

  async getMonthlySummary(propertyId: string, year: number, month: number): Promise<any> {
    if (!propertyId) {
      throw new Error('Property ID is required');
    }

    if (!year || !month || month < 1 || month > 12) {
      throw new Error('Valid year and month (1-12) are required');
    }

    const transactions = await this.repository.findByPropertyAndPeriod(propertyId, month, year);

    // Calculate summary statistics
    const totalUnits = transactions.length;
    const expectedRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const collectedAmount = transactions.reduce((sum, t) => sum + t.amountPaid, 0);
    const pendingAmount = expectedRevenue - collectedAmount;

    const paidCount = transactions.filter(t => t.status === RentTransactionStatus.PAID).length;
    const partialCount = transactions.filter(t => t.status === RentTransactionStatus.FINALIZED && t.amountPaid > 0).length;
    const pendingCount = transactions.filter(t => t.status === RentTransactionStatus.DRAFT || (t.amountPaid === 0 && t.status === RentTransactionStatus.FINALIZED)).length;

    const collectionRate = expectedRevenue > 0 ? (collectedAmount / expectedRevenue) * 100 : 0;
    const avgRentPerUnit = totalUnits > 0 ? expectedRevenue / totalUnits : 0;

    return {
      period: { year, month },
      totalUnits,
      expectedRevenue,
      collectedAmount,
      pendingAmount,
      collectionRate,
      avgRentPerUnit,
      statusBreakdown: {
        paid: paidCount,
        partial: partialCount,
        pending: pendingCount
      },
      transactions
    };
  }

  // Preview functionality
  async previewInvoice(transactionId: string): Promise<any> {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const transaction = await this.repository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Get related data for invoice generation
    const lease = await this.leaseRepository.findById(transaction.leaseId);
    if (!lease) {
      throw new Error('Lease not found for transaction');
    }

    const property = await this.propertyRepository.findById(transaction.propertyId);
    if (!property) {
      throw new Error('Property not found for transaction');
    }

    const tenant = await this.tenantRepository.findById(transaction.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found for transaction');
    }

    // Get property owner (landlord) details
    const landlord = await this.userRepository.findById(property.ownerId);

    // Get configured utilities for this unit and calculate their charges
    const configuredUtilities = await this.calculateUnitUtilityCharges(
      transaction.unitId,
      transaction.billingPeriodStart,
      transaction.billingPeriodEnd
    );
    
    // Build invoice data structure
    const invoiceData = {
      documentType: 'invoice' as const,
      documentNumber: `INV-${transaction.id.slice(0, 8).toUpperCase()}`,
      documentDate: new Date().toISOString(),

      // Property details
      property: {
        name: property.name,
        address: `${property.address.street}, ${property.address.city}, ${property.address.state} - ${property.address.pincode}`,
        phone: landlord?.phone || '',
        email: landlord?.email || '',
        website: '',
        logo: ''
      },

      // Tenant details
      tenant: {
        name: `${tenant.firstName} ${tenant.lastName}`,
        unitNumber: lease.unitId, // This should be the unit number
        address: tenant.currentAddress
          ? `${tenant.currentAddress.street}, ${tenant.currentAddress.city}, ${tenant.currentAddress.state} - ${tenant.currentAddress.pincode}`
          : undefined,
        phone: tenant.phone || '',
        email: tenant.email
      },

      // Billing period
      billingPeriod: {
        start: transaction.billingPeriodStart.toISOString(),
        end: transaction.billingPeriodEnd.toISOString(),
        month: transaction.billingPeriodStart.toLocaleString('default', { month: 'long' }),
        year: transaction.billingPeriodStart.getFullYear().toString()
      },

      // Line items
      lineItems: [
        {
          description: 'Base Rent',
          quantity: 1,
          rate: transaction.baseRent,
          amount: transaction.baseRent
        },
        // Add utility charges as line items
        ...configuredUtilities.map((u: any) => ({
          description: `${u.utilityName} (${u.billingMethod === 'fixed' ? 'Fixed' : 'Meter-based'})`,
          quantity: 1,
          rate: u.amount,
          amount: u.amount
        })),
        // Add additional expenses
        ...(transaction.expenses || []).map((e: any) => ({
          description: e.description || e.type,
          quantity: 1,
          rate: e.amount,
          amount: e.amount
        }))
      ],

      // Totals
      subtotal: transaction.baseRent,
      previousBalance: transaction.previousBalance,
      totalAmount: transaction.totalAmount,
      amountPaid: transaction.amountPaid,
      balanceDue: transaction.newBalance,

      // Additional info
      dueDate: transaction.billingPeriodEnd.toISOString(),
      lateFee: 0,
      notes: transaction.notes || 'Thank you for your payment',
      terms: 'Payment is due within 30 days of invoice date.'
    };

    return invoiceData;
  }

  async previewReceipt(transactionId: string): Promise<any> {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const transaction = await this.repository.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== RentTransactionStatus.PAID) {
      throw new Error('Cannot preview receipt for unpaid transaction');
    }

    // Get related data for receipt generation
    const lease = await this.leaseRepository.findById(transaction.leaseId);
    if (!lease) {
      throw new Error('Lease not found for transaction');
    }

    const property = await this.propertyRepository.findById(transaction.propertyId);
    if (!property) {
      throw new Error('Property not found for transaction');
    }

    const tenant = await this.tenantRepository.findById(transaction.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found for transaction');
    }

    // Get property owner (landlord) details
    const landlord = await this.userRepository.findById(property.ownerId);

    // Build receipt data structure
    const receiptData = {
      documentType: 'receipt' as const,
      documentNumber: transaction.receiptNumber || `REC-${transaction.id.slice(0, 8).toUpperCase()}`,
      documentDate: (transaction.paidDate || new Date()).toISOString(),

      // Property details
      property: {
        name: property.name,
        address: `${property.address.street}, ${property.address.city}, ${property.address.state} - ${property.address.pincode}`,
        phone: landlord?.phone || '',
        email: landlord?.email || '',
        website: '',
        logo: ''
      },

      // Tenant details
      tenant: {
        name: `${tenant.firstName} ${tenant.lastName}`,
        unitNumber: lease.unitId, // This should be the unit number
        address: tenant.currentAddress
          ? `${tenant.currentAddress.street}, ${tenant.currentAddress.city}, ${tenant.currentAddress.state} - ${tenant.currentAddress.pincode}`
          : undefined,
        phone: tenant.phone || '',
        email: tenant.email
      },

      // Billing period
      billingPeriod: {
        start: transaction.billingPeriodStart.toISOString(),
        end: transaction.billingPeriodEnd.toISOString(),
        month: transaction.billingPeriodStart.toLocaleString('default', { month: 'long' }),
        year: transaction.billingPeriodStart.getFullYear().toString()
      },

      // Line items (what was paid)
      lineItems: [
        {
          description: 'Rent Payment',
          amount: transaction.amountPaid
        }
      ],

      // Totals
      subtotal: transaction.amountPaid,
      previousBalance: 0, // For receipts, we show what was paid
      totalAmount: transaction.amountPaid,
      amountPaid: transaction.amountPaid,
      balanceDue: 0, // Fully paid

      // Payment details
      payments: [{
        date: (transaction.paidDate || new Date()).toISOString(),
        method: transaction.paymentMethod || 'Unknown',
        amount: transaction.amountPaid,
        reference: transaction.transactionId || undefined
      }],

      // Additional info
      notes: transaction.notes || 'Payment received with thanks',
      terms: ''
    };

    return receiptData;
  }

  /**
   * Calculate utility charges for a unit during a billing period
   */
  private async calculateUnitUtilityCharges(unitId: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      // Get all enabled utilities for the unit
      const utilities = await this.unitUtilityService.getUnitUtilitiesByUnit(unitId);
      const enabledUtilities = utilities.filter(u => u.isEnabled);

      const utilityCharges = [];

      for (const utility of enabledUtilities) {
        let amount = 0;

        if (utility.billingMethod === 'fixed') {
          // Fixed amount utility
          amount = utility.fixedAmount || 0;
        } else if (utility.billingMethod === 'meter_based' && utility.meterId) {
          // Meter-based utility - calculate usage
          try {
            const charges = await this.unitUtilityService.calculateUtilityCharges(
              unitId,
              startDate,
              endDate
            );

            // Find the charge for this specific utility
            const utilityCharge = charges.find((c: any) => c.utilityId === utility.id);
            if (utilityCharge) {
              amount = utilityCharge.amount;
            }
          } catch (error) {
            console.error(`Error calculating meter-based charges for utility ${utility.id}:`, error);
            // Fall back to 0 if calculation fails
            amount = 0;
          }
        }

        if (amount > 0) {
          utilityCharges.push({
            utilityId: utility.id,
            utilityType: utility.utilityType,
            utilityName: utility.utilityName,
            billingMethod: utility.billingMethod,
            amount: amount
          });
        }
      }

      return utilityCharges;
    } catch (error) {
      console.error('Error calculating unit utility charges:', error);
      // Log the error but return empty array to allow transaction creation to continue
      return []; // Return empty array if calculation fails
    }
  }

  private generateInvoiceNumber(): string {
    const now = new Date();
    const timestamp = now.getTime();
    return `INV-${timestamp}`;
  }

  private generateReceiptNumber(): string {
    const now = new Date();
    const timestamp = now.getTime();
    return `REC-${timestamp}`;
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