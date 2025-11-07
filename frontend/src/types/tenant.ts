export const TenantStatus = { ACTIVE: 'active', INACTIVE: 'inactive', BLACKLISTED: 'blacklisted' } as const;
export type TenantStatusValue = typeof TenantStatus[keyof typeof TenantStatus];

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface TenantInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  occupation?: string;
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
}
