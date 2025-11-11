// Property-related type definitions for frontend
import type { CurrencyCode } from './currency';

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

// Owner contact information
export interface OwnerContact {
  name: string;
  mobileNumbers: string[]; // Up to 5 mobile numbers
  emailIds: string[]; // Up to 5 email IDs
  website?: string;
}

// Property amenities and additional information
export interface PropertyAmenities {
  basic: string[]; // Basic amenities (parking, security, etc.)
  luxury: string[]; // Luxury amenities (gym, pool, etc.)
  additionalInfo: {
    petFriendly: boolean;
    smokingAllowed: boolean;
    eventsAllowed: boolean;
    customRules?: string;
  };
}

// File attachments for property
export interface PropertyFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'photo' | 'document';
  uploadedAt: string;
  description?: string;
}

// Bank details for receipts
export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

// Wallet details for UPI payments
export interface WalletDetails {
  type: 'PAYTM' | 'PHONEPE' | 'GPAY' | 'AMAZONPAY' | 'OTHER';
  upiPhoneNumber: string;
  upiName: string;
  upiId: string;
  generateUPILinks: boolean; // Checkbox for UPI payment links
}

// Receipt template settings tied to property
export interface PropertyReceiptTemplate {
  id?: string;
  propertyId: string;

  // Bank Details
  bankDetails: BankDetails;

  // Wallet Details (multiple wallets allowed)
  wallets: WalletDetails[];

  // Payment QR Code
  paymentQRCodeUrl?: string;
  paymentQRCodeFile?: File;

  // Signature and Watermark
  signatureUrl?: string;
  signatureFile?: File;
  watermarkUrl?: string;
  watermarkFile?: File;

  // Additional receipt information
  additionalInfo: {
    termsAndConditions?: string;
    paymentInstructions?: string;
    contactInfo?: string;
    customFooter?: string;
  };

  // Template metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface Property {
  id: string; // UUID
  name: string;
  description?: string;
  propertyType: PropertyTypeValue;
  status: PropertyStatusValue;
  currency: CurrencyCode; // Currency for this property

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

  // Enhanced owner details
  ownerDetails: OwnerContact;

  // Enhanced amenities and additional info
  amenities: PropertyAmenities;

  // Place photos and documents
  files: PropertyFile[];

  // Receipt template tied to this property
  receiptTemplate?: PropertyReceiptTemplate;

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
  currency?: CurrencyCode; // Currency for this property

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

  // Enhanced owner details
  ownerDetails: OwnerContact;

  // Enhanced amenities and additional info
  amenities?: PropertyAmenities;

  // Place photos and documents (file uploads handled separately)
  files?: PropertyFile[];

  // Receipt template tied to this property
  receiptTemplate?: Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>;

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