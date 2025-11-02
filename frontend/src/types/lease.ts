export const LeaseStatus = { ACTIVE: 'active', EXPIRED: 'expired', TERMINATED: 'terminated', PENDING: 'pending' } as const;
export type LeaseStatusValue = typeof LeaseStatus[keyof typeof LeaseStatus];

export interface Lease {
  id: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  rentDueDay: number;
  status: LeaseStatusValue;
  terms?: string;
  specialConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaseInput {
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  rentDueDay: number;
  terms?: string;
  specialConditions?: string;
}
