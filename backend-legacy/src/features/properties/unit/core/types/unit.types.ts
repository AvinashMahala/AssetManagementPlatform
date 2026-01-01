export enum UnitType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  COMMERCIAL = 'commercial',
  OFFICE = 'office',
  SHOP = 'shop',
  STUDIO = 'studio',
  ROOM = 'room'
}

export enum UnitStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  UNDER_MAINTENANCE = 'under_maintenance',
  VACANT = 'vacant'
}

export enum UtilityBillingMethod {
  FIXED = 'fixed',
  METER_BASED = 'meter_based'
}

export enum UtilityType {
  ELECTRICITY = 'electricity',
  WATER = 'water',
  GAS = 'gas',
  INTERNET = 'internet',
  MAINTENANCE = 'maintenance',
  PARKING = 'parking',
  OTHER = 'other'
}

export interface UnitUtility {
  id: string;
  unitId: string;
  propertyId: string;
  utilityType: UtilityType;
  utilityName: string;
  isEnabled: boolean;
  billingMethod: UtilityBillingMethod;
  fixedAmount?: number;
  meterId?: string;
  multiplier?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitUtilityInput {
  unitId: string;
  propertyId: string;
  utilityType: UtilityType;
  utilityName: string;
  isEnabled?: boolean;
  billingMethod: UtilityBillingMethod;
  fixedAmount?: number;
  meterId?: string;
  multiplier?: number;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  unitName?: string;
  description?: string;
  unitType: UnitType;
  status: UnitStatus;
  floor?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  furnished: boolean;
  maxOccupants?: number;
  unitAmenities: string[];
  unitPhotos: string[];
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  utilities?: UnitUtility[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitInput {
  propertyId: string;
  unitNumber: string;
  unitName?: string;
  description?: string;
  unitType: UnitType;
  status?: UnitStatus;
  floor?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  furnished?: boolean;
  maxOccupants?: number;
  unitAmenities?: string[];
  unitPhotos?: string[];
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
}
