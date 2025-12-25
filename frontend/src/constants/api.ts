// API-related constants
export const API_BASE_URL = 'http://localhost:5001';

export const API_ENDPOINTS = {
  ASSETS: '/api/v1/assets',
  PROPERTIES: '/api/v1/properties',
  UNITS: '/api/v1/units',
  TENANTS: '/api/v1/tenants',
  LEASES: '/api/v1/leases',
  RENT_PAYMENTS: '/api/v1/rent-payments',
  RECEIPTS: '/api/v1/receipts',
  EXPENSES: '/api/v1/expenses',
  USERS: '/api/v1/users',
  USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    PROFILE: '/api/v1/auth/profile',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh-token',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification',
    GOOGLE_AUTH: '/api/v1/auth/google-auth',
    PASSWORD_RESET_OPTIONS: '/api/v1/auth/password-reset-options',
    SECURITY_QUESTIONS: '/api/v1/auth/security-questions',
    RECOVERY_CODES: '/api/v1/auth/recovery-codes',
  },
  HEALTH: '/api/health',
} as const;

// API timeout in milliseconds. Derive from environment via Vite (VITE_API_TIMEOUT),
// falling back to 30000 (30s) when not set or invalid.
const parsedApiTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT ?? '', 10);
export const API_TIMEOUT = (!Number.isNaN(parsedApiTimeout) && parsedApiTimeout > 0)
  ? parsedApiTimeout
  : 30000; // ms

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