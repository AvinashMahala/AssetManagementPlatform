
import { IRentTransactionRepository } from './IRentTransactionRepository';
import { RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams, RentTransactionStatus, RentCollectionWorkflowStatus } from './rent-transaction.types';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { ILeaseRepository } from '@/features/leases/core/interfaces/ILeaseRepository';
import { ITenantRepository } from '@/features/tenants/tenant/core/interfaces/ITenantRepository';
import { IPropertyRepository } from '@/features/properties/property/core/interfaces/IPropertyRepository';
import { IUserRepository } from '@/features/auth/user/core/IUserRepository';
import { IRentTransactionMeterReadingRepository } from './IRentTransactionMeterReadingRepository';

export class RentTransactionService {
  constructor(
    private readonly repository: IRentTransactionRepository,
    private readonly leaseRepository: ILeaseRepository,
    private readonly tenantRepository: ITenantRepository,
    private readonly propertyRepository: IPropertyRepository,
    private readonly userRepository: IUserRepository,
    private readonly meterReadingRepository: IRentTransactionMeterReadingRepository,
    private readonly eventBus: EventBus
  ) {}

  async getAllTransactions(): Promise<RentTransaction[]> {
    return this.repository.findAll();
  }

  async getTransactionById(id: string): Promise<RentTransaction | null> {
    return this.repository.findById(id);
  }

  async getTransactionsByLease(leaseId: string): Promise<RentTransaction[]> {
    return this.repository.findByLease(leaseId);
  }

  async getTransactionsByProperty(propertyId: string): Promise<RentTransaction[]> {
    return this.repository.findByProperty(propertyId);
  }

  async getTransactionsByTenant(tenantId: string): Promise<RentTransaction[]> {
    return this.repository.findByTenant(tenantId);
  }

  async getTransactionsByUnit(unitId: string): Promise<RentTransaction[]> {
    return this.repository.findByUnit(unitId);
  }

  async getTransactionsByBillingPeriod(start: Date, end: Date): Promise<RentTransaction[]> {
    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }
    return this.repository.findByBillingPeriod(start, end);
  }

  async getPendingTransactions(): Promise<RentTransaction[]> {
    return this.repository.findPendingTransactions();
  }

  async getOverdueTransactions(): Promise<RentTransaction[]> {
    return this.repository.findOverdueTransactions();
  }

  async getTransactionsByDateRange(start: Date, end: Date): Promise<RentTransaction[]> {
    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }
    return this.repository.findTransactionsByDateRange(start, end);
  }

  async createTransaction(data: CreateRentTransactionParams): Promise<RentTransaction> {
    // Validate lease exists
    const lease = await this.leaseRepository.findById(data.leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }

    // Validate property exists
    const property = await this.propertyRepository.findById(data.propertyId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Validate tenant exists
    const tenant = await this.tenantRepository.findById(data.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Validate createdBy user
    if (data.createdBy) {
      const user = await this.userRepository.findById(data.createdBy);
      if (!user) {
        throw new Error(`Created by user not found: ${data.createdBy}`);
      }
    }

    const transactionInput = {
      ...data,
      status: data.status || RentTransactionStatus.DRAFT,
      workflowStatus: data.workflowStatus || RentCollectionWorkflowStatus.INVOICE_PENDING,
      invoiceGenerated: false,
      notificationSent: false,
      receiptSent: false
    };

    const transaction = await this.repository.create(transactionInput);

    // Handle meter readings
    if (data.meterReadings && data.meterReadings.length > 0) {
      try {
        const meterReadingInputs = data.meterReadings.map(mr => ({
          ...mr,
          transactionId: transaction.id
        }));
        await this.meterReadingRepository.createBatch(meterReadingInputs);
      } catch (error) {
        console.error('Error saving meter readings:', error);
        // Continue - don't fail transaction creation if meter readings fail
      }
    }
    
    // Publish event
    await this.eventBus.publish('RentTransactionCreated', {
      transactionId: transaction.id,
      leaseId: transaction.leaseId,
      totalAmount: transaction.totalAmount,
      status: transaction.status
    });

    return transaction;
  }

  async updateTransaction(id: string, data: UpdateRentTransactionParams): Promise<RentTransaction | null> {
    const existingTransaction = await this.repository.findById(id);
    if (!existingTransaction) {
      throw new Error('Transaction not found');
    }

    // Recalculate amounts if components changed
    let updatedData = { ...data };
    if (data.baseRent !== undefined || data.previousBalance !== undefined ||
        data.totalExpenses !== undefined || data.amountPaid !== undefined || data.totalMeterCharges !== undefined) {
      
      const baseRent = data.baseRent !== undefined ? data.baseRent : existingTransaction.baseRent;
      const previousBalance = data.previousBalance !== undefined ? data.previousBalance : existingTransaction.previousBalance;
      const totalExpenses = data.totalExpenses !== undefined ? data.totalExpenses : existingTransaction.totalExpenses;
      const totalMeterCharges = data.totalMeterCharges !== undefined ? data.totalMeterCharges : existingTransaction.totalMeterCharges;
      const amountPaid = data.amountPaid !== undefined ? data.amountPaid : existingTransaction.amountPaid;

      updatedData.totalAmount = baseRent + previousBalance + totalExpenses + totalMeterCharges;
      updatedData.newBalance = updatedData.totalAmount - amountPaid;
    }

    const transaction = await this.repository.update(id, updatedData);
    
    if (transaction) {
      await this.eventBus.publish('RentTransactionUpdated', {
        transactionId: transaction.id,
        status: transaction.status
      });
    }

    return transaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    if (result) {
      await this.eventBus.publish('RentTransactionDeleted', { transactionId: id });
    }
    return result;
  }

  async markTransactionAsPaid(id: string, paidDate: Date, paymentMethod?: string, transactionId?: string): Promise<boolean> {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = await this.repository.update(id, {
      paidDate: paidDate,
      status: RentTransactionStatus.PAID,
      newBalance: 0,
      amountPaid: transaction.totalAmount // Assume full payment
    });

    if (updatedTransaction) {
      await this.eventBus.publish('RentTransactionPaid', {
        transactionId: id,
        paidDate,
        paymentMethod,
        externalTransactionId: transactionId
      });
      return true;
    }
    return false;
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
    // Placeholder
    return [];
  }

  async getCurrentMonthTransaction(leaseId: string): Promise<RentTransaction | null> {
    // Placeholder
    return null;
  }

  async getUnitHistory(unitId: string): Promise<RentTransaction[]> {
    return this.repository.findByUnit(unitId);
  }

  async recordPayment(transactionId: string, amountPaid: number, paymentMethod: string, paymentDate: Date, paymentReference?: string): Promise<RentTransaction | null> {
    // Placeholder
    return null;
  }

  async getLastMeterReadings(unitId: string): Promise<any[]> {
    // Placeholder
    return [];
  }
}
