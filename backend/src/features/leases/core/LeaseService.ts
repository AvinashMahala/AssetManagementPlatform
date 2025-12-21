import { EventBus } from '@/shared/infrastructure/event-bus/EventBus';
import { LeaseRepository } from '../data/LeaseRepository';
import { CreateLeaseDTO, UpdateLeaseDTO, Lease, LeaseStatus } from './lease.types';
import { LEASE_EVENTS } from './lease.events';
import { v4 as uuidv4 } from 'uuid';

export class LeaseService {
  constructor(
    private readonly leaseRepository: LeaseRepository,
    private readonly eventBus: EventBus
  ) {}

  async createLease(data: CreateLeaseDTO): Promise<Lease> {
    const lease: Lease = {
      ...data,
      id: uuidv4(),
      status: data.status || LeaseStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createdLease = await this.leaseRepository.create(lease);

    await this.eventBus.publish(LEASE_EVENTS.CREATED, {
      leaseId: createdLease.id,
      tenantId: createdLease.tenantId,
      propertyId: createdLease.propertyId,
      startDate: createdLease.startDate,
      endDate: createdLease.endDate,
      monthlyRent: createdLease.monthlyRent,
      timestamp: new Date()
    });

    return createdLease;
  }

  async updateLease(id: string, data: UpdateLeaseDTO): Promise<Lease | null> {
    const updatedLease = await this.leaseRepository.update(id, {
      ...data,
      updatedAt: new Date()
    });

    if (updatedLease) {
      await this.eventBus.publish(LEASE_EVENTS.UPDATED, {
        leaseId: updatedLease.id,
        changes: data,
        timestamp: new Date()
      });
    }

    return updatedLease;
  }

  async terminateLease(id: string, terminationDate: Date, reason?: string): Promise<Lease | null> {
    const updatedLease = await this.leaseRepository.update(id, {
      status: LeaseStatus.TERMINATED,
      terminatedAt: terminationDate,
      terminationReason: reason,
      updatedAt: new Date()
    });

    if (updatedLease) {
      await this.eventBus.publish(LEASE_EVENTS.TERMINATED, {
        leaseId: updatedLease.id,
        terminationDate,
        reason,
        timestamp: new Date()
      });
    }

    return updatedLease;
  }

  async getLease(id: string): Promise<Lease | null> {
    return this.leaseRepository.findById(id);
  }

  async listLeases(propertyId?: string): Promise<Lease[]> {
    if (propertyId) {
      return this.leaseRepository.findByPropertyId(propertyId);
    }
    return this.leaseRepository.findAll();
  }
}
