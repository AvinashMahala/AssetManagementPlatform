export const LeaseStatus = { DRAFT: 'draft', ACTIVE: 'active', EXPIRED: 'expired', TERMINATED: 'terminated' } as const;
export type LeaseStatusValue = typeof LeaseStatus[keyof typeof LeaseStatus];

export interface Lease {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  unitNumber?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  lateFeeAmount?: number;
  gracePeriodDays?: number;
  paymentDueDay?: number;
  termsConditions?: string;
  specialClauses?: string;
  maintenanceCharges?: number;
  rentDueDay: number;
  status: LeaseStatusValue;
  noticePeriodDays?: number;
  autoRenewal?: boolean;
  paymentFrequency?: string;
  electricityCharges?: number;
  waterCharges?: number;
  otherCharges?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  specialConditions?: string;
  signedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  leaseDocumentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaseInput {
  propertyId: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  lateFeeAmount?: number;
  gracePeriodDays?: number;
  paymentDueDay?: number;
  termsConditions?: string;
  specialClauses?: string;
  maintenanceCharges?: number;
  rentDueDay: number;
  noticePeriodDays?: number;
  autoRenewal?: boolean;
  paymentFrequency?: string;
  electricityCharges?: number;
  waterCharges?: number;
  otherCharges?: number;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  sublettingAllowed?: boolean;
  specialConditions?: string;
  signedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
  leaseDocumentUrl?: string;
}
