import { Lease, LeaseInput } from '../../models/Lease';

export interface ILeaseRepository {
  findAll(): Promise<Lease[]>;
  findById(id: number): Promise<Lease | null>;
  findByProperty(propertyId: number): Promise<Lease[]>;
  findByTenant(tenantId: number): Promise<Lease[]>;
  findActiveLeases(): Promise<Lease[]>;
  findExpiringLeases(days: number): Promise<Lease[]>; // leases expiring within X days
  create(data: Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lease>;
  update(id: number, data: Partial<Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Lease | null>;
  delete(id: number): Promise<boolean>;
  terminateLease(id: number, terminationReason: string): Promise<boolean>;
  renewLease(id: number, newEndDate: Date): Promise<Lease | null>;
}