
export enum MeterType {
  ELECTRICITY = 'electricity',
  WATER = 'water',
  GAS = 'gas'
}

export interface Meter {
  id: string;
  unitId: string;
  propertyId: string;
  meterType: MeterType;
  meterName: string;
  meterNumber?: string;
  multiplier: number;
  remarks?: string;
  costPerUnit: number;
  fixedCharge?: number;
  installationDate?: Date;
  status: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MeterInput {
  unitId: string;
  propertyId: string;
  meterType: MeterType;
  meterName: string;
  meterNumber?: string;
  multiplier?: number;
  remarks?: string;
  costPerUnit: number;
  fixedCharge?: number;
  installationDate?: Date;
  status?: string;
  isActive?: boolean;
}

export interface MeterReading {
  id: string;
  meterId: string;
  readingDate: Date;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  totalCost: number;
  meterPhotoUrl?: string;
  rentTransactionId?: string;
  recordedBy: string;
  createdAt: Date;
}

export interface MeterReadingInput {
  meterId: string;
  readingDate: Date;
  previousReading: number;
  currentReading: number;
  meterPhotoUrl?: string;
  rentTransactionId?: string;
  recordedBy: string;
}

export interface MeterTrendData {
  month: string;
  unitsConsumed: number;
  totalCost: number;
}
