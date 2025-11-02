// Validation rules and constraints
export const VALIDATION = {
  PROPERTY: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 255,
    },
    DESCRIPTION: {
      MAX_LENGTH: 1000,
    },
    AREA: {
      MIN_VALUE: 1,
      MAX_VALUE: 100000, // 100,000 sq ft max
    },
    RENT: {
      MIN_VALUE: 0,
    },
    SECURITY_DEPOSIT: {
      MIN_VALUE: 0,
    },
    MAINTENANCE_CHARGES: {
      MIN_VALUE: 0,
    },
    ADDRESS: {
      STREET_MAX_LENGTH: 255,
      CITY_MAX_LENGTH: 100,
      STATE_MAX_LENGTH: 100,
      PINCODE_PATTERN: /^\d{6}$/,
      LANDMARK_MAX_LENGTH: 255,
    },
    AMENITIES: {
      MAX_COUNT: 50,
      MAX_LENGTH: 100,
    },
    PHOTOS: {
      MAX_COUNT: 20,
      MAX_URL_LENGTH: 500,
    },
  },
  TENANT: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 100,
    },
    EMAIL: {
      MAX_LENGTH: 255,
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PHONE: {
      PATTERN: /^\+?[1-9]\d{1,14}$/,
    },
    INCOME: {
      MIN_VALUE: 0,
    },
  },
  LEASE: {
    NOTICE_PERIOD: {
      MIN_DAYS: 1,
      MAX_DAYS: 365,
    },
    RENT_DUE_DAY: {
      MIN_VALUE: 1,
      MAX_VALUE: 31,
    },
  },
  RENT_PAYMENT: {
    AMOUNT: {
      MIN_VALUE: 0,
    },
    LATE_FEE: {
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
  PROPERTY: {
    NAME_REQUIRED: 'Property name is required',
    NAME_TOO_LONG: 'Property name must be less than 255 characters',
    DESCRIPTION_TOO_LONG: 'Property description must be less than 1000 characters',
    INVALID_PROPERTY_TYPE: 'Invalid property type',
    INVALID_STATUS: 'Invalid property status',
    AREA_REQUIRED: 'Property area is required',
    AREA_INVALID: 'Property area must be between 1 and 100,000 sq ft',
    RENT_REQUIRED: 'Monthly rent is required',
    RENT_NEGATIVE: 'Monthly rent cannot be negative',
    SECURITY_DEPOSIT_NEGATIVE: 'Security deposit cannot be negative',
    MAINTENANCE_CHARGES_NEGATIVE: 'Maintenance charges cannot be negative',
    ADDRESS_REQUIRED: 'Property address is required',
    STREET_REQUIRED: 'Street address is required',
    STREET_TOO_LONG: 'Street address must be less than 255 characters',
    CITY_REQUIRED: 'City is required',
    CITY_TOO_LONG: 'City must be less than 100 characters',
    STATE_REQUIRED: 'State is required',
    STATE_TOO_LONG: 'State must be less than 100 characters',
    PINCODE_REQUIRED: 'Pincode is required',
    PINCODE_INVALID: 'Pincode must be a valid 6-digit number',
    LANDMARK_TOO_LONG: 'Landmark must be less than 255 characters',
    OWNER_REQUIRED: 'Property owner is required',
    INVALID_ID: 'Invalid property ID',
    AMENITIES_TOO_MANY: 'Too many amenities (max 50)',
    AMENITY_TOO_LONG: 'Amenity name too long (max 100 characters)',
    PHOTOS_TOO_MANY: 'Too many photos (max 20)',
    PHOTO_URL_TOO_LONG: 'Photo URL too long (max 500 characters)',
  },
  TENANT: {
    FIRST_NAME_REQUIRED: 'First name is required',
    FIRST_NAME_TOO_LONG: 'First name must be less than 100 characters',
    LAST_NAME_TOO_LONG: 'Last name must be less than 100 characters',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Invalid email format',
    EMAIL_TOO_LONG: 'Email must be less than 255 characters',
    EMAIL_EXISTS: 'Email already exists',
    PHONE_REQUIRED: 'Phone number is required',
    PHONE_INVALID: 'Invalid phone number format',
    INCOME_NEGATIVE: 'Monthly income cannot be negative',
    INVALID_ID: 'Invalid tenant ID',
    NOT_FOUND: 'Tenant not found',
  },
  LEASE: {
    PROPERTY_REQUIRED: 'Property is required',
    TENANT_REQUIRED: 'Tenant is required',
    START_DATE_REQUIRED: 'Lease start date is required',
    END_DATE_REQUIRED: 'Lease end date is required',
    INVALID_DATE_RANGE: 'End date must be after start date',
    NOTICE_PERIOD_INVALID: 'Notice period must be between 1 and 365 days',
    RENT_DUE_DAY_INVALID: 'Rent due day must be between 1 and 31',
    INVALID_ID: 'Invalid lease ID',
    PROPERTY_NOT_AVAILABLE: 'Property is not available for the selected dates',
  },
  RENT_PAYMENT: {
    LEASE_REQUIRED: 'Lease is required',
    AMOUNT_REQUIRED: 'Payment amount is required',
    AMOUNT_NEGATIVE: 'Payment amount cannot be negative',
    DUE_DATE_REQUIRED: 'Due date is required',
    INVALID_ID: 'Invalid payment ID',
    LATE_FEE_NEGATIVE: 'Late fee cannot be negative',
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