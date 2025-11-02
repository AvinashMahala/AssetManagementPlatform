// Unit types
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

// Unit status
export enum UnitStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  UNDER_MAINTENANCE = 'under_maintenance',
  VACANT = 'vacant'
}

export interface Unit {
  id: string; // UUID
  propertyId: string; // UUID reference to properties table
  unitNumber: string; // e.g., "101", "Villa-A", "Office-1"
  unitName?: string; // Optional display name
  description?: string;
  unitType: UnitType;
  status: UnitStatus;

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

  // Metadata
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

// Unit-Tenant relationship for shared housing support
export interface UnitTenant {
  id: string; // UUID
  unitId: string; // UUID reference to units table
  tenantId: string; // UUID reference to tenants table
  isPrimaryTenant: boolean;

  // Occupancy details
  moveInDate?: Date;
  moveOutDate?: Date;

  // Financial sharing
  monthlyRentShare: number; // Amount this tenant pays
  securityDepositShare: number; // Amount this tenant contributes

  status: 'active' | 'inactive' | 'evicted';

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitTenantInput {
  unitId: string;
  tenantId: string;
  isPrimaryTenant?: boolean;
  moveInDate?: Date;
  moveOutDate?: Date;
  monthlyRentShare: number;
  securityDepositShare: number;
  status?: 'active' | 'inactive' | 'evicted';
}