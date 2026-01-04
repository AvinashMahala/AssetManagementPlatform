export interface MeterAllocation {
  id: string;
  meterId: string;
  subscriptionId: string;
  allocationFraction: number;
  allocationRule?: string; // JSON string
  effectiveFrom?: string;
  effectiveTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeterAllocationInput {
  meterId: string;
  subscriptionId: string;
  allocationFraction: number;
  allocationRule?: string; // JSON string
  effectiveFrom?: string;
  effectiveTo?: string;
}

export interface MeterAllocationFilters {
  meterId?: string;
  subscriptionId?: string;
}
