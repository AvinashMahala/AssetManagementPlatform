
import { IRentPaymentRepository } from './IRentPaymentRepository';
import { RentPayment, CreateRentPaymentParams, UpdateRentPaymentParams, PaymentStatus } from './rent-payment.types';
import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { ILeaseRepository } from '@/interfaces/repositories/ILeaseRepository';
import { ITenantRepository } from '@/features/tenants/tenant/core/interfaces/ITenantRepository';
// Property repository might be needed if we validate propertyId, but it's optional in the schema.
// I'll skip PropertyRepository for now unless strictly needed, to reduce coupling.

export class RentPaymentService {
  constructor(
    private readonly repository: IRentPaymentRepository,
    private readonly leaseRepository: ILeaseRepository,
    private readonly tenantRepository: ITenantRepository,
    private readonly eventBus: EventBus
  ) {}

  async getAllPayments(): Promise<RentPayment[]> {
    return this.repository.findAll();
  }

  async getPaymentById(id: string): Promise<RentPayment | null> {
    return this.repository.findById(id);
  }

  async getPaymentsByLease(leaseId: string): Promise<RentPayment[]> {
    return this.repository.findByLease(leaseId);
  }

  async getPaymentsByProperty(propertyId: string): Promise<RentPayment[]> {
    return this.repository.findByProperty(propertyId);
  }

  async getPaymentsByTenant(tenantId: string): Promise<RentPayment[]> {
    return this.repository.findByTenant(tenantId);
  }

  async getPendingPayments(): Promise<RentPayment[]> {
    return this.repository.findPendingPayments();
  }

  async getOverduePayments(): Promise<RentPayment[]> {
    return this.repository.findOverduePayments();
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<RentPayment[]> {
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }
    return this.repository.findPaymentsByDateRange(startDate, endDate);
  }

  async createPayment(data: CreateRentPaymentParams): Promise<RentPayment> {
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

    const payment = await this.repository.create(data);
    
    // Publish event
    await this.eventBus.publish('RentPaymentCreated', {
      paymentId: payment.id,
      leaseId: payment.leaseId,
      amount: payment.amount,
      status: payment.status
    });

    return payment;
  }

  async updatePayment(id: string, data: UpdateRentPaymentParams): Promise<RentPayment | null> {
    const payment = await this.repository.update(id, data);
    
    if (payment) {
      await this.eventBus.publish('RentPaymentUpdated', {
        paymentId: payment.id,
        status: payment.status
      });
    }

    return payment;
  }

  async deletePayment(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    if (result) {
      await this.eventBus.publish('RentPaymentDeleted', { paymentId: id });
    }
    return result;
  }
}
