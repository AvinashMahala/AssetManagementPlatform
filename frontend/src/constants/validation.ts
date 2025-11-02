// Validation-related constants
export const VALIDATION_RULES = {
  ASSET: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },
    DESCRIPTION: {
      MAX_LENGTH: 500,
    },
    VALUE: {
      MIN: 0.01,
      MAX: 999999999.99,
    },
    LOCATION: {
      MAX_LENGTH: 100,
    },
  },
  USER: {
    USERNAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 50,
      PATTERN: /^[a-zA-Z0-9_-]+$/,
    },
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PASSWORD: {
      MIN_LENGTH: 8,
      PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    },
  },
} as const;

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_WEAK: 'Password must contain at least 8 characters with uppercase, lowercase, and number',
  USERNAME_INVALID: 'Username can only contain letters, numbers, underscores, and hyphens',
  VALUE_INVALID: 'Value must be a positive number',
  NAME_TOO_LONG: 'Name must be less than 100 characters',
  DESCRIPTION_TOO_LONG: 'Description must be less than 500 characters',
  LOCATION_TOO_LONG: 'Location must be less than 100 characters',
} as const;