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
  id: string; // UUID
  tenantId: string; // UUID
  documentType: DocumentType;
  documentNumber?: string;
  fileUrl: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string; // UUID reference to users
  uploadedAt: Date;
}

export interface Tenant {
  id: string; // UUID
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
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

  permanentAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Emergency contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Additional fields from database
  totalRentals?: number;
  currentPropertyId?: string;

  status: TenantStatus;

  // Documents array (populated by service)
  documents?: TenantDocument[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
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

  permanentAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  // Emergency contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Additional fields
  totalRentals?: number;
  currentPropertyId?: string;

  status?: TenantStatus;
}

export interface Lease {
  id: string; // UUID
  propertyId: string; // UUID reference to properties
  unitId: string; // UUID reference to units
  primaryTenantId: string; // UUID reference to tenants

  // Lease terms
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status: 'active' | 'expired' | 'terminated' | 'draft';
  leaseTerms?: string;
  signedAt?: Date;

  // Created by user
  createdBy: string; // UUID reference to users

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaseInput {
  propertyId: string;
  unitId: string;
  primaryTenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  status?: 'active' | 'expired' | 'terminated' | 'draft';
  leaseTerms?: string;
  signedAt?: Date;
  createdBy: string;
}

export interface RentPayment {
  id: string; // UUID
  leaseId: string; // UUID reference to leases
  tenantId: string; // UUID reference to tenants

  // Payment details
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  notes?: string;

  // Created by user
  createdBy: string; // UUID reference to users

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface RentPaymentInput {
  leaseId: string;
  tenantId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  createdBy: string;
}