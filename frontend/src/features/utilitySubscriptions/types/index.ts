export interface UtilitySubscription {
  id: string;
  unitId: string;
  utilityTypeId: string;
  subscriptionName?: string;
  isEnabled: boolean;
  billingMethod: 'fixed' | 'meter_allocated';
  fixedAmount?: number;
  billingMultiplier: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UtilitySubscriptionInput {
  unitId: string;
  utilityTypeId: string;
  subscriptionName?: string;
  isEnabled?: boolean;
  billingMethod: 'fixed' | 'meter_allocated';
  fixedAmount?: number;
  billingMultiplier?: number;
  notes?: string;
}

export interface UtilitySubscriptionFilters {
  unitId?: string;
}
