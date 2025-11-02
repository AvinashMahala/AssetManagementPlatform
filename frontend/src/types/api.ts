// API-related type definitions
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface RequestConfig extends Omit<RequestInit, 'body' | 'headers'> {
  params?: Record<string, any>;
  data?: any;
  headers?: Record<string, string>;
}

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API endpoints
export interface ApiEndpoints {
  assets: {
    list: string;
    create: string;
    get: (id: number) => string;
    update: (id: number) => string;
    delete: (id: number) => string;
  };
  users: {
    register: string;
    login: string;
    profile: string;
  };
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Generic async state
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}