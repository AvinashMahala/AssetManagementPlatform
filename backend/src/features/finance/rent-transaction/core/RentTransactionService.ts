
import { IRentTransactionRepository } from './IRentTransactionRepository';
import { RentTransaction, CreateRentTransactionParams, UpdateRentTransactionParams } from './rent-transaction.types';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { ILeaseRepository } from '@/interfaces/repositories/ILeaseRepository';
import { ITenantRepository } from '@/features/tenants/tenant/core/interfaces/ITenantRepository';

export class RentTransactionService {
  constructor(
    private readonly repository: IRentTransactionRepository,
    private readonly leaseRepository: ILeaseRepository,
    private readonly tenantRepository: ITenantRepository,
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

  async createTransaction(data: CreateRentTransactionParams): Promise<RentTransaction> {
    // Validate lease exists
    const lease = await this.leaseRepository.findById(data.leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }

    // Validate tenant exists
    const tenant = await this.tenantRepository.findById(data.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const transaction = await this.repository.create(data);
    
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
    const transaction = await this.repository.update(id, data);
    
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
}
