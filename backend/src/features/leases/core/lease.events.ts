import { Lease } from './lease.types';

export const LEASE_EVENTS = {
  CREATED: 'lease.created',
  UPDATED: 'lease.updated',
  TERMINATED: 'lease.terminated',
  EXPIRING_SOON: 'lease.expiring_soon',
  EXPIRED: 'lease.expired'
};

export interface LeaseCreatedEvent {
  type: typeof LEASE_EVENTS.CREATED;
  payload: {
    leaseId: string;
    tenantId: string;
    propertyId: string;
    startDate: Date;
    endDate: Date;
    monthlyRent: number;
  };
  timestamp: Date;
}

export interface LeaseUpdatedEvent {
  type: typeof LEASE_EVENTS.UPDATED;
  payload: {
    leaseId: string;
    changes: Partial<Lease>;
  };
  timestamp: Date;
}

export interface LeaseTerminatedEvent {
  type: typeof LEASE_EVENTS.TERMINATED;
  payload: {
    leaseId: string;
    terminationDate: Date;
    reason?: string;
  };
  timestamp: Date;
}

export type LeaseEvent = LeaseCreatedEvent | LeaseUpdatedEvent | LeaseTerminatedEvent;
