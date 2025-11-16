export const UnitStatus = { AVAILABLE: 'available', OCCUPIED: 'occupied', UNDER_MAINTENANCE: 'under_maintenance', VACANT: 'vacant' } as const;
export type UnitStatusValue = typeof UnitStatus[keyof typeof UnitStatus];

export const UnitType = { APARTMENT: 'apartment', HOUSE: 'house', VILLA: 'villa', COMMERCIAL: 'commercial', OFFICE: 'office', SHOP: 'shop', STUDIO: 'studio', ROOM: 'room' } as const;
export type UnitTypeValue = typeof UnitType[keyof typeof UnitType];

export const UtilityType = {
  ELECTRICITY: 'electricity',
  WATER: 'water',
  GAS: 'gas',
  INTERNET: 'internet',
  MAINTENANCE: 'maintenance',
  PARKING: 'parking',
  OTHER: 'other'
} as const;
export type UtilityTypeValue = typeof UtilityType[keyof typeof UtilityType];

export const UtilityBillingMethod = {
  FIXED: 'fixed',
  METER_BASED: 'meter_based'
} as const;
export type UtilityBillingMethodValue = typeof UtilityBillingMethod[keyof typeof UtilityBillingMethod];

export interface UnitUtility {
  id: string;
  unitId: string;
  propertyId: string;
  utilityType: UtilityTypeValue;
  utilityName: string;
  isEnabled: boolean;
  billingMethod: UtilityBillingMethodValue;
  fixedAmount?: number;
  meterId?: string;
  multiplier?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnitUtilityInput {
  unitId: string;
  propertyId: string;
  utilityType: UtilityTypeValue;
  utilityName: string;
  isEnabled?: boolean;
  billingMethod: UtilityBillingMethodValue;
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
  unitType: UnitTypeValue;
  status: UnitStatusValue;

  // Unit specifications
  floor?: number;
  area: number; // in sq ft
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  furnished: boolean;
  maxOccupants?: number;

  // Unit amenities and features
  unitAmenities: string[]; // ['wifi', 'parking', 'ac', 'tv', etc.]
  unitPhotos: string[]; // array of photo URLs

  // Financial details (per unit)
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;

  // Utility configurations
  utilities?: UnitUtility[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface UnitInput {
  propertyId: string;
  unitNumber: string;
  unitName?: string;
  description?: string;
  unitType: UnitTypeValue;
  status?: UnitStatusValue;

  // Unit specifications
  floor?: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  furnished?: boolean;
  maxOccupants?: number;

  // Unit amenities and features
  unitAmenities?: string[];
  unitPhotos?: string[];

  // Financial details
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
}
