// Validation rules and constraints
export const VALIDATION = {
  ASSET: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 255,
    },
    VALUE: {
      MIN_VALUE: 0,
    },
  },
  USER: {
    USERNAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 50,
    },
    EMAIL: {
      MAX_LENGTH: 255,
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PHONE: {
      PATTERN: /^\+?[1-9]\d{1,14}$/,
    },
    PASSWORD: {
      MIN_LENGTH: 6,
      MAX_LENGTH: 128,
    },
    ROLE: {
      ALLOWED_VALUES: ['admin', 'user'] as const,
    },
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  ASSET: {
    NAME_REQUIRED: 'Asset name is required',
    NAME_TOO_LONG: 'Asset name must be less than 255 characters',
    VALUE_NEGATIVE: 'Asset value cannot be negative',
    INVALID_ID: 'Invalid asset ID',
  },
  USER: {
    USERNAME_REQUIRED: 'Username is required',
    USERNAME_TOO_SHORT: 'Username must be at least 3 characters long',
    USERNAME_TOO_LONG: 'Username must be less than 50 characters',
    USERNAME_EXISTS: 'Username already exists',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Invalid email format',
    EMAIL_EXISTS: 'Email already exists',
    EMAIL_TOO_LONG: 'Email must be less than 255 characters',
    PHONE_REQUIRED: 'Phone number is required',
    PHONE_INVALID: 'Invalid phone number format',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
    PASSWORD_TOO_LONG: 'Password must be less than 128 characters',
    ROLE_INVALID: 'Invalid role. Must be either "admin" or "user"',
    INVALID_ID: 'Invalid user ID',
    NOT_FOUND: 'User not found',
  },
  GENERAL: {
    INTERNAL_ERROR: 'Internal server error',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
  },
} as const;