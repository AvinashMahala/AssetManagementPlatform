// API-related constants
export const API_BASE_URL = 'http://localhost:5001';

export const API_ENDPOINTS = {
  ASSETS: '/api/assets',
  PROPERTIES: '/api/properties',
  UNITS: '/api/units',
  TENANTS: '/api/tenants',
  LEASES: '/api/leases',
  RENT_PAYMENTS: '/api/rent-payments',
  RECEIPTS: '/api/receipts',
  USERS: '/api/users',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    LOGOUT: '/api/auth/logout',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
    GOOGLE_AUTH: '/api/auth/google-auth',
    PASSWORD_RESET_OPTIONS: '/api/auth/password-reset-options',
    SECURITY_QUESTIONS: '/api/auth/security-questions',
    RECOVERY_CODES: '/api/auth/recovery-codes',
  },
  HEALTH: '/api/health',
} as const;

export const API_TIMEOUT = 30000; // 30 seconds

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
} as const;