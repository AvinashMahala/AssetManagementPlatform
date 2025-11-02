// Property-related type definitions for frontend
export const PropertyType = {
  APARTMENT: 'apartment',
  HOUSE: 'house',
  VILLA: 'villa',
  COMMERCIAL: 'commercial',
  PG_HOSTEL: 'pg_hostel',
  CO_LIVING: 'co_living',
  OFFICE: 'office',
  SHOP: 'shop',
  WAREHOUSE: 'warehouse'
} as const;

export type PropertyTypeValue = typeof PropertyType[keyof typeof PropertyType];

// Property status
export const PropertyStatus = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  UNDER_MAINTENANCE: 'under_maintenance',
  VACANT: 'vacant'
} as const;

export type PropertyStatusValue = typeof PropertyStatus[keyof typeof PropertyStatus];

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Property {
  id: string; // UUID
  name: string;
  description?: string;
  propertyType: PropertyTypeValue;
  status: PropertyStatusValue;

  // Address details (Indian format)
  address: PropertyAddress;

  // Building specifications
  totalArea: number; // in sq ft
  totalFloors?: number;
  yearBuilt?: number;
  parkingSpaces?: number;

  // Building amenities and features
  buildingAmenities: string[];
  buildingPhotos: string[];

  // Ownership details
  ownerId: string; // UUID reference to users table
  coOwners?: string[]; // array of user UUIDs

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PropertyInput {
  name: string;
  description?: string;
  propertyType: PropertyTypeValue;
  status?: PropertyStatusValue;

  // Address details
  address: PropertyAddress;

  // Building specifications
  totalArea: number;
  totalFloors?: number;
  yearBuilt?: number;
  parkingSpaces?: number;

  // Building amenities and features
  buildingAmenities?: string[];
  buildingPhotos?: string[];

  // Ownership details
  ownerId: string;
  coOwners?: string[];
}

export interface PropertyFilters {
  search?: string;
  propertyType?: PropertyTypeValue;
  status?: PropertyStatusValue;
  city?: string;
  state?: string;
  minArea?: number;
  maxArea?: number;
  sortBy?: 'name' | 'propertyType' | 'status' | 'totalArea' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PropertyListResponse {
  properties: Property[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}