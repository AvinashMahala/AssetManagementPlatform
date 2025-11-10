// Expense types enum
export enum ExpenseType {
  WIFI_INTERNET = 'wifi_internet',
  FOOD_MEALS = 'food_meals',
  INVERTER_GENERATOR = 'inverter_generator',
  CABLE_DISH = 'cable_dish',
  SURVEILLANCE_CAMERAS = 'surveillance_cameras',
  LAUNDRY = 'laundry',
  WATER_BILL = 'water_bill',
  PLUMBING = 'plumbing',
  WATER_HEATER = 'water_heater',
  AC_REPAIR = 'ac_repair',
  FURNITURE_REPAIR = 'furniture_repair',
  CLEANING = 'cleaning',
  HOUSEKEEPING = 'housekeeping',
  PAINTING = 'painting',
  ELECTRICAL_WORK = 'electrical_work',
  OTHER = 'other'
}

// Expense frequency
export enum ExpenseFrequency {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

// Expense distribution method
export enum ExpenseDistribution {
  OWNER_ONLY = 'owner_only',
  SPLIT_AMONG_TENANTS = 'split_among_tenants',
  SPECIFIC_UNITS = 'specific_units'
}

// Expense status
export enum ExpenseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

// Expense interface
export interface Expense {
  id: string;
  propertyId: string;
  unitId?: string; // null for property-wide expenses

  // Expense details
  type: ExpenseType;
  description: string;
  amount: number;

  // Frequency and timing
  frequency: ExpenseFrequency;
  startDate: Date;
  endDate?: Date;

  // Distribution
  distribution: ExpenseDistribution;
  affectedUnitIds?: string[]; // for SPECIFIC_UNITS distribution

  // Attachments
  billPhotoUrl?: string;

  // Status and metadata
  status: ExpenseStatus;
  isActive: boolean; // computed from status

  // Audit fields
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Expense input for creation
export interface ExpenseInput {
  propertyId: string;
  unitId?: string;
  type: ExpenseType;
  description: string;
  amount: number;
  frequency: ExpenseFrequency;
  startDate: Date;
  endDate?: Date;
  distribution: ExpenseDistribution;
  affectedUnitIds?: string[];
  billPhotoUrl?: string;
  status?: ExpenseStatus;
  createdBy: string;
  updatedBy?: string;
}

// Expense update input
export interface ExpenseUpdateInput {
  type?: ExpenseType;
  description?: string;
  amount?: number;
  frequency?: ExpenseFrequency;
  startDate?: Date;
  endDate?: Date;
  distribution?: ExpenseDistribution;
  affectedUnitIds?: string[];
  billPhotoUrl?: string;
  status?: ExpenseStatus;
  updatedBy?: string;
}

// Expense filter options
export interface ExpenseFilters {
  propertyId?: string;
  unitId?: string;
  type?: ExpenseType;
  frequency?: ExpenseFrequency;
  distribution?: ExpenseDistribution;
  status?: ExpenseStatus;
  isActive?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
}

// Expense statistics
export interface ExpenseStatistics {
  totalExpenses: number;
  activeExpenses: number;
  totalMonthlyAmount: number;
  expensesByType: Record<ExpenseType, number>;
  expensesByFrequency: Record<ExpenseFrequency, number>;
  expensesByDistribution: Record<ExpenseDistribution, number>;
}

// Expense with related data
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