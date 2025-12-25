export enum LeaseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated'
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  unitId?: string;
  unitNumber?: string;

  // Lease terms
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  lateFeeAmount?: number;
  gracePeriodDays?: number;
  paymentDueDay?: number;
  termsConditions?: string;
  specialClauses?: string;
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

export interface CreateLeaseDTO extends Omit<Lease, 'id' | 'createdAt' | 'updatedAt' | 'status'> {
  status?: LeaseStatus;
}

export interface UpdateLeaseDTO extends Partial<Omit<Lease, 'id' | 'createdAt' | 'updatedAt'>> {}

export type LeaseInput = CreateLeaseDTO;
