// Lease status
export enum LeaseStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed'
}

// Payment frequency
export enum PaymentFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  HALF_YEARLY = 'half_yearly',
  YEARLY = 'yearly'
}

export interface Lease {
  id: number;
  propertyId: number;
  tenantId: number;

  // Lease terms
  startDate: Date;
  endDate: Date;
  noticePeriodDays: number; // notice period in days
  autoRenewal: boolean;

  // Financial terms
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  paymentFrequency: PaymentFrequency;
  rentDueDay: number; // day of month when rent is due (1-31)

  // Additional charges
  electricityCharges?: 'tenant_responsible' | 'landlord_responsible' | 'included';
  waterCharges?: 'tenant_responsible' | 'landlord_responsible' | 'included';
  otherCharges?: {
    name: string;
    amount: number;
    frequency: PaymentFrequency;
  }[];

  // Lease conditions
  petsAllowed: boolean;
  smokingAllowed: boolean;
  sublettingAllowed: boolean;
  specialConditions?: string;

  // Status and tracking
  status: LeaseStatus;
  signedAt?: Date;
  terminatedAt?: Date;
  terminationReason?: string;

  // Document storage
  leaseDocumentUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseInput {
  propertyId: number;
  tenantId: number;

  // Lease terms
  startDate: Date;
  endDate: Date;
  noticePeriodDays?: number;
  autoRenewal?: boolean;

  // Financial terms
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  paymentFrequency?: PaymentFrequency;
  rentDueDay?: number;

  // Additional charges
  electricityCharges?: 'tenant_responsible' | 'landlord_responsible' | 'included';
  waterCharges?: 'tenant_responsible' | 'landlord_responsible' | 'included';
  otherCharges?: {
    name: string;
    amount: number;
    frequency: PaymentFrequency;
  }[];

  // Lease conditions
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  specialConditions?: string;

  // Document
  leaseDocumentUrl?: string;
}