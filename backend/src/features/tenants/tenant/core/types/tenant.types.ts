export enum TenantStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLACKLISTED = 'blacklisted'
}

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

export interface TenantAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface TenantDocument {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  documentName?: string;
  documentNumber?: string;
  fileUrl: string;
  fileSize?: number;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  uploadedAt: Date;
}

export interface Tenant {
  id: string;
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
  currentAddress: TenantAddress;
  permanentAddress?: TenantAddress;

  // Emergency contact
  emergencyContact?: EmergencyContact;

  // Additional fields
  totalRentals?: number;
  currentPropertyId?: string;

  status: TenantStatus;

  // Documents
  documents?: TenantDocument[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export type CreateTenantDTO = Omit<Tenant, 'id' | 'createdAt' | 'updatedAt' | 'documents' | 'totalRentals' | 'currentPropertyId'>;
export type UpdateTenantDTO = Partial<CreateTenantDTO>;
