// Lease status
export enum LeaseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated'
}

export interface Lease {
  id: string; // UUID
  propertyId: string; // UUID reference to properties
  unitId: string; // UUID reference to units
  primaryTenantId: string; // UUID reference to tenants

  // Lease terms
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status: LeaseStatus;
  leaseTerms?: string;
  signedAt?: Date;

  // Created by user
  createdBy: string; // UUID reference to users

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseInput {
  propertyId: string;
  unitId: string;
  primaryTenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status?: LeaseStatus;
  leaseTerms?: string;
  signedAt?: Date;
  createdBy: string;
}