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

export enum ExpenseFrequency {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly'
}

export enum ExpenseDistribution {
  OWNER_ONLY = 'owner_only',
  SPLIT_AMONG_TENANTS = 'split_among_tenants',
  SPECIFIC_UNITS = 'specific_units'
}

export enum ExpenseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

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

export interface ExpenseWithDetails extends Expense {
  propertyName?: string;
  unitName?: string;
  createdByName?: string;
}

export interface ExpenseFilters {
  propertyId?: string;
  unitId?: string;
  type?: ExpenseType;
  status?: ExpenseStatus;
  startDate?: Date;
  endDate?: Date;
}
