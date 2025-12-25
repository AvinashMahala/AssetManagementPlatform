import { Lease, LeaseInput } from '../lease.types';

export interface ILeaseService {
  getAllLeases(): Promise<Lease[]>;
  getLeaseById(id: string): Promise<Lease | null>;
  getLeasesByProperty(propertyId: string): Promise<Lease[]>;
  getLeasesByTenant(tenantId: string): Promise<Lease[]>;
  getActiveLeases(): Promise<Lease[]>;
  getExpiringLeases(days: number): Promise<Lease[]>;
  createLease(leaseData: LeaseInput): Promise<Lease>;
  updateLease(id: string, leaseData: Partial<LeaseInput>): Promise<Lease | null>;
  deleteLease(id: string): Promise<boolean>;
  terminateLease(id: string, terminationReason: string): Promise<boolean>;
  renewLease(id: string, newEndDate: Date): Promise<Lease | null>;

  // Validation methods
  validateLeaseDates(startDate: Date, endDate: Date): boolean;
  checkPropertyAvailability(propertyId: string, startDate: Date, endDate: Date): Promise<boolean>;
  calculateLeaseDuration(startDate: Date, endDate: Date): number; // in months
}
