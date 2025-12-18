import type { PropertyInput, ApiError } from '../../../types';

export type TabId = 'basic' | 'address' | 'details' | 'owner' | 'amenities' | 'files' | 'receipt';

export interface PropertyFormTabbedProps {
  initialData?: Partial<PropertyInput>;
  onSubmit: (data: PropertyInput) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
  propertyName?: string;
  propertyId?: string;
  apiError?: ApiError | null;
}

export type FormErrors = Record<string, string>;
