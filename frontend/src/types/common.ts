// Common/shared type definitions
export type ID = number | string;

export type Status = 'active' | 'inactive' | 'pending' | 'archived';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type SortOrder = 'asc' | 'desc';

export type Theme = 'light' | 'dark' | 'auto';

export type Language = 'en' | 'es' | 'fr' | 'de';

// Form field types
export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched?: boolean;
}

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
  style?: React.CSSProperties;
}

export interface ButtonVariant {
  primary: 'primary';
  secondary: 'secondary';
  danger: 'danger';
  success: 'success';
  warning: 'warning';
}

export interface ButtonSize {
  small: 'small';
  medium: 'medium';
  large: 'large';
}

export type ButtonVariantType = keyof ButtonVariant;
export type ButtonSizeType = keyof ButtonSize;

// Event handlers
export type ChangeHandler<T = unknown> = (value: T) => void;
export type ClickHandler = (event: React.MouseEvent) => void;
export type SubmitHandler<T = unknown> = (data: T) => void | Promise<void>;

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};