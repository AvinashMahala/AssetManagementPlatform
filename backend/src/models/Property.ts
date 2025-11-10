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

  // Receipt customization settings
  receiptSettings?: PropertyReceiptSettings;

  // Receipt template settings
  templateId?: string;
  templateOverrides?: Partial<ReceiptTemplateSettings>;
}