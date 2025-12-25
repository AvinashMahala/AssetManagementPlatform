import { ReceiptTemplateSettings } from '@/features/finance/receipt-template/core/receipt-template.types';

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

export enum PropertyStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  UNDER_MAINTENANCE = 'under_maintenance',
  VACANT = 'vacant'
}

export interface OwnerContact {
  name: string;
  mobileNumbers: string[];
  emailIds: string[];
  website?: string;
}

export interface PropertyAmenities {
  basic: string[];
  luxury: string[];
  additionalInfo: {
    petFriendly: boolean;
    smokingAllowed: boolean;
    eventsAllowed: boolean;
    customRules?: string;
  };
}

export interface PropertyFile {
  id: string;
  propertyId: string;
  fileId: string;
  fileName: string;
  fileType: 'photo' | 'document';
  description?: string;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface WalletDetails {
  type: 'PAYTM' | 'PHONEPE' | 'GPAY' | 'AMAZONPAY' | 'OTHER';
  upiPhoneNumber: string;
  upiName: string;
  upiId: string;
  generateUPILinks: boolean;
}

export interface PropertyReceiptTemplate {
  id: string;
  propertyId: string;
  bankDetails: BankDetails;
  wallets: WalletDetails[];
  paymentQRCodeUrl?: string;
  signatureUrl?: string;
  watermarkUrl?: string;
  additionalInfo: {
    termsAndConditions?: string;
    paymentInstructions?: string;
    contactInfo?: string;
    customFooter?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyReceiptSettings {
  logoUrl?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  wallets: Array<{
    type: 'PAYTM' | 'PHONEPE' | 'GPAY' | 'AMAZONPAY' | 'OTHER';
    number: string;
    name: string;
  }>;
  upiId?: string;
  paymentQRCodeUrl?: string;
  signatureUrl?: string;
  watermarkUrl?: string;
  receiptPrefix?: string;
  receiptCounter: number;
}

export interface Property {
  id: string;
  name: string;
  description?: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  currency: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
  };
  totalArea: number;
  totalFloors?: number;
  yearBuilt?: number;
  parkingSpaces?: number;
  buildingAmenities: string[];
  buildingPhotos: string[];
  ownerDetails: OwnerContact;
  amenities: PropertyAmenities;
  files?: PropertyFile[];
  receiptTemplate?: PropertyReceiptTemplate;
  ownerId: string;
  coOwners?: string[];
  receiptSettings?: PropertyReceiptSettings;
  templateId?: string;
  templateOverrides?: Partial<ReceiptTemplateSettings>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyInput {
  name: string;
  description?: string;
  propertyType: PropertyType;
  status?: PropertyStatus;
  currency?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    landmark?: string;
  };
  totalArea: number;
  totalFloors?: number;
  yearBuilt?: number;
  parkingSpaces?: number;
  buildingAmenities?: string[];
  buildingPhotos?: string[];
  ownerDetails?: OwnerContact;
  amenities?: PropertyAmenities;
  files?: PropertyFile[];
  receiptTemplate?: Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>;
  ownerId?: string;
  coOwners?: string[];
  receiptSettings?: PropertyReceiptSettings;
  templateId?: string;
  templateOverrides?: Partial<ReceiptTemplateSettings>;
}
