import { VALIDATION_RULES, VALIDATION_MESSAGES } from '../constants/validation';
import type { AssetInput, UserInput, UserLoginInput } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

// Generic validation function
export function validateField(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return VALIDATION_MESSAGES.REQUIRED;
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be less than ${rules.maxLength} characters`;
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  if (value && typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return `Must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && value > rules.max) {
      return `Must be less than ${rules.max}`;
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
}

// Asset validation
export function validateAsset(assetData: AssetInput): ValidationResult {
  const errors: Record<string, string> = {};

  const nameError = validateField(assetData.name, {
    required: true,
    minLength: VALIDATION_RULES.ASSET.NAME.MIN_LENGTH,
    maxLength: VALIDATION_RULES.ASSET.NAME.MAX_LENGTH,
  });
  if (nameError) errors.name = nameError;

  if (assetData.description) {
    const descError = validateField(assetData.description, {
      maxLength: VALIDATION_RULES.ASSET.DESCRIPTION.MAX_LENGTH,
    });
    if (descError) errors.description = descError;
  }

  const valueError = validateField(assetData.value, {
    required: true,
    min: VALIDATION_RULES.ASSET.VALUE.MIN,
  });
  if (valueError) errors.value = valueError;

  if (assetData.location) {
    const locationError = validateField(assetData.location, {
      maxLength: VALIDATION_RULES.ASSET.LOCATION.MAX_LENGTH,
    });
    if (locationError) errors.location = locationError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// User validation
export function validateUserRegistration(userData: UserInput): ValidationResult {
  const errors: Record<string, string> = {};

  const usernameError = validateField(userData.username, {
    required: true,
    minLength: VALIDATION_RULES.USER.USERNAME.MIN_LENGTH,
    maxLength: VALIDATION_RULES.USER.USERNAME.MAX_LENGTH,
    pattern: VALIDATION_RULES.USER.USERNAME.PATTERN,
  });
  if (usernameError) errors.username = usernameError;

  const emailError = validateField(userData.email, {
    required: true,
    pattern: VALIDATION_RULES.USER.EMAIL.PATTERN,
  });
  if (emailError) errors.email = emailError;

  const passwordError = validateField(userData.password, {
    required: true,
    minLength: VALIDATION_RULES.USER.PASSWORD.MIN_LENGTH,
    pattern: VALIDATION_RULES.USER.PASSWORD.PATTERN,
    custom: (value) => {
      if (!VALIDATION_RULES.USER.PASSWORD.PATTERN.test(value)) {
        return VALIDATION_MESSAGES.PASSWORD_WEAK;
      }
      return null;
    },
  });
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateUserLogin(credentials: UserLoginInput): ValidationResult {
  const errors: Record<string, string> = {};

  const emailError = validateField(credentials.email, {
    required: true,
    pattern: VALIDATION_RULES.USER.EMAIL.PATTERN,
  });
  if (emailError) errors.email = emailError;

  const passwordError = validateField(credentials.password, {
    required: true,
  });
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Form validation helpers
export function validateFormField(
  value: any,
  rules: ValidationRule
): { isValid: boolean; error: string | null } {
  const error = validateField(value, rules);
  return {
    isValid: !error,
    error,
  };
}

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: Record<keyof T, ValidationRule>
): ValidationResult {
  const errors: Record<string, string> = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}