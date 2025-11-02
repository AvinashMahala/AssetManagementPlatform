// API-related constants
export const API_BASE_URL = 'http://localhost:5001';

export const API_ENDPOINTS = {
  ASSETS: '/api/assets',
  USERS: '/api/users',
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    PROFILE: '/api/users/profile',
  },
  HEALTH: '/health',
} as const;

export const API_TIMEOUT = 10000; // 10 seconds

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