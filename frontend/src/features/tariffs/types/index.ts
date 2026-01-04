export interface Tariff {
  id: string;
  utilityTypeId: string;
  subscriptionId?: string;
  meterId?: string;
  name?: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  ratePerUnit: number;
  fixedCharge?: number;
  tieredRates?: string; // JSON string
  metadata?: string; // JSON string
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TariffInput {
  utilityTypeId: string;
  subscriptionId?: string;
  meterId?: string;
  name?: string;
  description?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  ratePerUnit: number;
  fixedCharge?: number;
  tieredRates?: string; // JSON string
}

export interface TariffFilters {
  utilityTypeId?: string;
  subscriptionId?: string;
  meterId?: string;
}
