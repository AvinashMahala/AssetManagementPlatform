// Meter types for utility tracking
export enum MeterType {
  ELECTRICITY = 'electricity',
  WATER = 'water',
  GAS = 'gas'
}

export interface Meter {
  id: string; // UUID
  unitId: string; // UUID reference to units table
  propertyId: string; // UUID reference to properties table

  // Meter details
  meterType: MeterType;
  meterName: string; // e.g., "Main Electricity Meter", "Kitchen Water Meter"
  meterNumber?: string; // optional meter number/serial
  multiplier: number; // multiplier for calculations (default 1.0)
  remarks?: string;

  // Pricing configuration
  costPerUnit: number; // cost per unit (e.g., ₹ per kWh, ₹ per liter)
  fixedCharge?: number; // monthly fixed charge if any

  // Installation and status
  installationDate?: Date;
  status: string; // meter status (active, inactive, faulty, etc.)
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface MeterInput {
  unitId: string;
  propertyId: string;

  // Meter details
  meterType: MeterType;
  meterName: string;
  meterNumber?: string;
  multiplier?: number;
  remarks?: string;

  // Pricing configuration
  costPerUnit: number;
  fixedCharge?: number;

  // Installation and status
  installationDate?: Date;
  status?: string;
  isActive?: boolean;
}

export interface MeterReading {
  id: string; // UUID
  meterId: string; // UUID reference to meters table

  // Reading details
  readingDate: Date;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number; // auto-calculated: current - previous
  totalCost: number; // auto-calculated: (unitsConsumed * costPerUnit) + fixedCharge

  // Photo evidence
  meterPhotoUrl?: string;

  // Link to rent transaction (when utility cost is added to rent)
  rentTransactionId?: string;

  // Audit
  recordedBy: string; // UUID reference to users table

  // Metadata
  createdAt: Date;
}

export interface MeterReadingInput {
  meterId: string;

  // Reading details
  readingDate: Date;
  previousReading: number;
  currentReading: number;

  // Photo evidence
  meterPhotoUrl?: string;

  // Link to rent transaction
  rentTransactionId?: string;

  // Audit
  recordedBy: string;
}

// Statistics and trend data interfaces
export interface MeterTrendData {
  month: string; // YYYY-MM format
  unitsConsumed: number;
  totalCost: number;
  readingDate: Date;
}

export interface MeterStatistics {
  meterId: string;
  meterName: string;
  meterType: MeterType;
  totalReadings: number;
  averageUnitsConsumed: number;
  averageCost: number;
  lastReadingDate?: Date;
  lastUnitsConsumed?: number;
  lastCost?: number;
  differenceFromAverage: number; // + or - from 6-month average
  differenceFromLastMonth: number; // + or - from previous month
  trendDirection: 'up' | 'down' | 'stable'; // based on last 3 months
}