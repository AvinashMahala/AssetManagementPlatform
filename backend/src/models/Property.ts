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
  id: string; // UUID
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

  // Building specifications
  totalArea: number; // in sq ft (maps to 'area' column)
  totalFloors?: number;
  yearBuilt?: number;
  parkingSpaces?: number;

  // Building amenities and features
  buildingAmenities: string[]; // maps to 'amenities' column
  buildingPhotos: string[]; // maps to 'photos' column

  // Ownership details
  ownerId: string; // UUID reference to users table
  coOwners?: string[]; // array of user UUIDs

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