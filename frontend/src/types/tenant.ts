export const TenantStatus = { ACTIVE: 'active', INACTIVE: 'inactive', BLACKLISTED: 'blacklisted' } as const;
export type TenantStatusValue = typeof TenantStatus[keyof typeof TenantStatus];

export const TenantPrefix = { MR: 'Mr.', MRS: 'Mrs.', DR: 'Dr.', MS: 'Ms.', PROF: 'Prof.' } as const;
export type TenantPrefixValue = typeof TenantPrefix[keyof typeof TenantPrefix];

export const ProfessionOptions = {
  ENGINEER: 'Engineer',
  DOCTOR: 'Doctor',
  TEACHER: 'Teacher',
  LAWYER: 'Lawyer',
  ACCOUNTANT: 'Accountant',
  BUSINESS_OWNER: 'Business Owner',
  STUDENT: 'Student',
  CONSULTANT: 'Consultant',
  DESIGNER: 'Designer',
  MARKETING: 'Marketing Professional',
  SALES: 'Sales Professional',
  IT_PROFESSIONAL: 'IT Professional',
  OTHER: 'Other'
} as const;
export type ProfessionValue = typeof ProfessionOptions[keyof typeof ProfessionOptions];

export const LeaseType = { UNTIL_LEAVES: 'until_leaves', FIXED_DEFINED: 'fixed_defined' } as const;
export type LeaseTypeValue = typeof LeaseType[keyof typeof LeaseType];

export const ExtraServices = { BIKE_PARKING: 'bike_parking', CAR_PARKING: 'car_parking' } as const;
export type ExtraServiceValue = typeof ExtraServices[keyof typeof ExtraServices];

export interface Tenant {
  id: string;
  prefix?: TenantPrefixValue;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profession?: ProfessionValue;
  occupation?: string; // For custom profession input
  companyName?: string;
  monthlyIncome?: number;
  currentAddress: { street: string; city: string; state: string; pincode: string };
  permanentAddress?: { street: string; city: string; state: string; pincode: string };
  emergencyContact?: { name: string; relationship: string; phone: string };
  status: TenantStatusValue;
  totalRentals?: number;
  currentPropertyId?: string;
  preferredLocations?: string[];
  notes?: string;

  // Enhanced fields
  photoUrl?: string;
  numberOfPeople?: number;
  moveInDate?: string;
  rentStartDate?: string;
  leaseType?: LeaseTypeValue;
  leaseStartDate?: string;
  leasePeriodMonths?: number;
  leaseExpiryDate?: string; // Auto-calculated
  extraServices?: ExtraServiceValue[];

  createdAt: string;
  updatedAt: string;
}

export interface TenantInput {
  prefix?: TenantPrefixValue;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profession?: ProfessionValue;
  occupation?: string; // For custom profession input
  companyName?: string;
  monthlyIncome?: number;
  currentAddress: { street: string; city: string; state: string; pincode: string };
  permanentAddress?: { street: string; city: string; state: string; pincode: string };
  emergencyContact?: { name: string; relationship: string; phone: string };
  status?: TenantStatusValue;
  totalRentals?: number;
  currentPropertyId?: string;
  preferredLocations?: string[];
  notes?: string;

  // Enhanced fields
  photoUrl?: string;
  numberOfPeople?: number;
  moveInDate?: string;
  rentStartDate?: string;
  leaseType?: LeaseTypeValue;
  leaseStartDate?: string;
  leasePeriodMonths?: number;
  leaseExpiryDate?: string; // Auto-calculated
  extraServices?: ExtraServiceValue[];
}
