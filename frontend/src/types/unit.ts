export const UnitStatus = { AVAILABLE: 'available', OCCUPIED: 'occupied', UNDER_MAINTENANCE: 'under_maintenance', RESERVED: 'reserved' } as const;
export type UnitStatusValue = typeof UnitStatus[keyof typeof UnitStatus];

export const UnitType = { ONE_BHK: '1bhk', TWO_BHK: '2bhk', THREE_BHK: '3bhk', FOUR_BHK: '4bhk', STUDIO: 'studio', ROOM: 'room', SHOP: 'shop', OFFICE: 'office' } as const;
export type UnitTypeValue = typeof UnitType[keyof typeof UnitType];

export const FurnishingType = { FURNISHED: 'furnished', SEMI_FURNISHED: 'semi_furnished', UNFURNISHED: 'unfurnished' } as const;
export type FurnishingTypeValue = typeof FurnishingType[keyof typeof FurnishingType];

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  floor?: number;
  unitType: UnitTypeValue;
  status: UnitStatusValue;
  carpetArea: number;
  builtUpArea?: number;
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  furnishingType: FurnishingTypeValue;
  rent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  amenities: string[];
  photos: string[];
  availableFrom?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitInput {
  propertyId: string;
  unitNumber: string;
  floor?: number;
  unitType: UnitTypeValue;
  status?: UnitStatusValue;
  carpetArea: number;
  builtUpArea?: number;
  bedrooms: number;
  bathrooms: number;
  balconies?: number;
  furnishingType: FurnishingTypeValue;
  rent: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  amenities?: string[];
  photos?: string[];
  availableFrom?: string;
  description?: string;
}
