// Property types for Indian rental market
import { ReceiptTemplateSettings } from './ReceiptTemplate';
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
  id: string; // UUID
  propertyId: string; // UUID reference to properties table
  fileId: string; // Reference to file in FileStorageService
  fileName: string;
  fileType: 'photo' | 'document';
  description?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
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
  id: string; // UUID
  propertyId: string; // UUID reference to properties table

  // Bank Details
  bankDetails: BankDetails;

  // Wallet Details (multiple wallets allowed)
  wallets: WalletDetails[];

  // Payment QR Code
  paymentQRCodeUrl?: string;

  // Signature and Watermark
  signatureUrl?: string;
  watermarkUrl?: string;

  // Additional receipt information
  additionalInfo: {
    termsAndConditions?: string;
    paymentInstructions?: string;
    contactInfo?: string;
    customFooter?: string;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string; // UUID
  name: string;
  description?: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  currency: string; // Currency code (e.g., 'INR', 'USD', 'EUR')

  // Address details (Indian format)
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
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

  // Enhanced owner details
  ownerDetails: OwnerContact;

  // Enhanced amenities and additional info
  amenities: PropertyAmenities;

  // Place photos and documents
  files?: PropertyFile[];

  // Receipt template tied to this property
  receiptTemplate?: PropertyReceiptTemplate;

  // Ownership details
  ownerId: string; // UUID reference to users table
  coOwners?: string[]; // array of user UUIDs

  // Receipt customization settings
  receiptSettings?: PropertyReceiptSettings;

  // Receipt template settings
  templateId?: string; // UUID reference to receipt_templates table
  templateOverrides?: Partial<ReceiptTemplateSettings>; // Property-specific overrides of template settings

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Receipt customization settings for properties
export interface PropertyReceiptSettings {
  // Logo
  logoUrl?: string;

  // Bank details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;

  // Wallet details (PayTM, PhonePe, GPay, etc.)
  wallets: Array<{
    type: 'PAYTM' | 'PHONEPE' | 'GPAY' | 'AMAZONPAY' | 'OTHER';
    number: string;
    name: string;
  }>;

  // UPI ID
  upiId?: string;

  // QR Code for payments
  paymentQRCodeUrl?: string;

  // Signature & Watermark
  signatureUrl?: string;
  watermarkUrl?: string;

  // Receipt numbering
  receiptPrefix?: string; // e.g., "RNT"
  receiptCounter: number; // auto-increment for receipt numbers
}

export interface PropertyInput {
  name: string;
  description?: string;
  propertyType: PropertyType;
  status?: PropertyStatus;
  currency?: string; // Currency code (e.g., 'INR', 'USD', 'EUR')

  // Address details
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
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

  // Enhanced owner details
  ownerDetails: OwnerContact;

  // Enhanced amenities and additional info
  amenities?: PropertyAmenities;

  // Place photos and documents (handled via separate endpoints)
  files?: PropertyFile[];

  // Receipt template tied to this property
  receiptTemplate?: Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>;

  // Ownership details
  ownerId: string;
  coOwners?: string[];

  // Receipt customization settings
  receiptSettings?: PropertyReceiptSettings;

  // Receipt template settings
  templateId?: string;
  templateOverrides?: Partial<ReceiptTemplateSettings>;
}