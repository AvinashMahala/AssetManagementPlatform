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
  tenantId: string; // UUID reference to tenants

  // Lease terms
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status: LeaseStatus;

  // Additional lease details
  noticePeriodDays?: number;
  autoRenewal?: boolean;
  maintenanceCharges?: number;
  paymentFrequency?: string;
  rentDueDay?: number;
  electricityCharges?: number;
  waterCharges?: number;
  otherCharges?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  specialConditions?: string;

  signedAt?: Date;
  terminatedAt?: Date;
  terminationReason?: string;
  leaseDocumentUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseInput {
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status?: LeaseStatus;
  noticePeriodDays?: number;
  autoRenewal?: boolean;
  maintenanceCharges?: number;
  paymentFrequency?: string;
  rentDueDay?: number;
  electricityCharges?: number;
  waterCharges?: number;
  otherCharges?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  specialConditions?: string;
  signedAt?: Date;
  terminatedAt?: Date;
  terminationReason?: string;
  leaseDocumentUrl?: string;
}