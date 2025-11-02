import { Lease, LeaseInput } from '../../models/Lease';

export interface ILeaseRepository {
  findAll(): Promise<Lease[]>;
  findById(id: string): Promise<Lease | null>;
  findByProperty(propertyId: string): Promise<Lease[]>;
  findByTenant(tenantId: string): Promise<Lease[]>;
  findActiveLeases(): Promise<Lease[]>;
  findExpiringLeases(days: number): Promise<Lease[]>; // leases expiring within X days
  create(data: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lease>;
  update(id: string, data: Partial<Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Lease | null>;
  delete(id: string): Promise<boolean>;
  terminateLease(id: string, terminationReason: string): Promise<boolean>;
  renewLease(id: string, newEndDate: Date): Promise<Lease | null>;
}