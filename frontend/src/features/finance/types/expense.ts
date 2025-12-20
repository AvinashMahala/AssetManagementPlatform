// Expense types and interfaces
export const ExpenseType = {
  WIFI_INTERNET: 'wifi_internet',
  FOOD_MEALS: 'food_meals',
  INVERTER_GENERATOR: 'inverter_generator',
  CABLE_DISH: 'cable_dish',
  SURVEILLANCE_CAMERAS: 'surveillance_cameras',
  LAUNDRY: 'laundry',
  WATER_BILL: 'water_bill',
  PLUMBING: 'plumbing',
  WATER_HEATER: 'water_heater',
  AC_REPAIR: 'ac_repair',
  FURNITURE_REPAIR: 'furniture_repair',
  CLEANING: 'cleaning',
  HOUSEKEEPING: 'housekeeping',
  PAINTING: 'painting',
  ELECTRICAL_WORK: 'electrical_work',
  OTHER: 'other'
} as const;
export type ExpenseTypeValue = typeof ExpenseType[keyof typeof ExpenseType];

export const ExpenseFrequency = {
  ONE_TIME: 'one_time',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
} as const;
export type ExpenseFrequencyValue = typeof ExpenseFrequency[keyof typeof ExpenseFrequency];

export const ExpenseDistribution = {
  OWNER_ONLY: 'owner_only',
  SPLIT_AMONG_TENANTS: 'split_among_tenants',
  SPECIFIC_UNITS: 'specific_units'
} as const;
export type ExpenseDistributionValue = typeof ExpenseDistribution[keyof typeof ExpenseDistribution];

export const ExpenseStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
} as const;
export type ExpenseStatusValue = typeof ExpenseStatus[keyof typeof ExpenseStatus];

export interface Expense {
  id: string;
  propertyId: string;
  unitId?: string;
  type: ExpenseTypeValue;
  description: string;
  amount: number;
  frequency: ExpenseFrequencyValue;
  startDate: string;
  endDate?: string;
  distribution: ExpenseDistributionValue;
  affectedUnitIds?: string[];
  billPhotoUrl?: string;
  status: ExpenseStatusValue;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  propertyId: string;
  unitId?: string;
  type: ExpenseTypeValue;
  description: string;
  amount: number;
  frequency: ExpenseFrequencyValue;
  startDate: string;
  endDate?: string;
  distribution: ExpenseDistributionValue;
  affectedUnitIds?: string[];
  billPhotoUrl?: string;
  status?: ExpenseStatusValue;
  createdBy: string;
  updatedBy?: string;
}

export interface ExpenseUpdateInput {
  type?: ExpenseTypeValue;
  description?: string;
  amount?: number;
  frequency?: ExpenseFrequencyValue;
  startDate?: string;
  endDate?: string;
  distribution?: ExpenseDistributionValue;
  affectedUnitIds?: string[];
  billPhotoUrl?: string;
  status?: ExpenseStatusValue;
  updatedBy?: string;
}

export interface ExpenseFilters {
  propertyId?: string;
  unitId?: string;
  type?: ExpenseTypeValue;
  frequency?: ExpenseFrequencyValue;
  distribution?: ExpenseDistributionValue;
  status?: ExpenseStatusValue;
  isActive?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
}

export interface ExpenseStatistics {
  totalExpenses: number;
  activeExpenses: number;
  totalMonthlyAmount: number;
  expensesByType: Record<ExpenseTypeValue, number>;
  expensesByFrequency: Record<ExpenseFrequencyValue, number>;
  expensesByDistribution: Record<ExpenseDistributionValue, number>;
}

export interface ExpenseWithDetails extends Expense {
  property?: {
    id: string;
    name: string;
  };
  unit?: {
    id: string;
    name: string;
    unitNumber: string;
  };
  affectedUnits?: Array<{
    id: string;
    name: string;
    unitNumber: string;
  }>;
}