// Tenant status
export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLACKLISTED = 'blacklisted'
}

// Document types for tenant verification
export enum DocumentType {
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  DRIVING_LICENSE = 'driving_license',
  PASSPORT = 'passport',
  EMPLOYMENT_LETTER = 'employment_letter',
  SALARY_SLIP = 'salary_slip',
  BANK_STATEMENT = 'bank_statement',
  PREVIOUS_LANDLORD_REFERENCE = 'previous_landlord_reference'
}

export interface TenantDocument {
  id: number;
  tenantId: number;
  documentType: DocumentType;
  documentNumber?: string;
  fileUrl: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: number; // user ID who verified
  uploadedAt: Date;
}

export interface Tenant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;

  // Personal details
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  companyName?: string;
  monthlyIncome?: number;

  // Address details
  currentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  permanentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Emergency contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Documents
  documents: TenantDocument[];

  // Rental history
  status: TenantStatus;
  totalRentals: number;
  currentPropertyId?: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  alternatePhone?: string;

  // Personal details
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
  companyName?: string;
  monthlyIncome?: number;

  // Address details
  currentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  permanentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Emergency contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Documents will be handled separately
  status?: TenantStatus;
}