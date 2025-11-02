// Property types for Indian rental market
export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  VILLA = 'villa',
  COMMERCIAL = 'commercial',
  PG_HOSTEL = 'pg_hostel',
  CO_LIVING = 'co_living',
  OFFICE = 'office',
  SHOP = 'shop',
  WAREHOUSE = 'warehouse'
}

// Property status
export enum PropertyStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  UNDER_MAINTENANCE = 'under_maintenance',
  VACANT = 'vacant'
}

export interface Property {
  id: number;
  name: string;
  description?: string;
  propertyType: PropertyType;
  status: PropertyStatus;

  // Address details (Indian format)
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };

  // Property specifications
  area: number; // in sq ft
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floor?: number;
  totalFloors?: number;

  // Amenities and features
  amenities: string[]; // ['parking', 'lift', 'security', 'gym', etc.]
  furnished: boolean;
  parkingSpaces?: number;

  // Financial details
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;

  // Ownership details
  ownerId: number;
  coOwners?: number[]; // array of user IDs

  // Property photos
  photos: string[]; // array of photo URLs

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyInput {
  name: string;
  description?: string;
  propertyType: PropertyType;
  status?: PropertyStatus;

  // Address details
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };

  // Property specifications
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  floor?: number;
  totalFloors?: number;

  // Amenities and features
  amenities?: string[];
  furnished?: boolean;
  parkingSpaces?: number;

  // Financial details
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharges?: number;

  // Ownership details
  ownerId: number;
  coOwners?: number[];

  // Property photos
  photos?: string[];
}