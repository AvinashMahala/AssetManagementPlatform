import type { ApiError } from '../types/api';

// Custom error class that preserves API error information
export class ApiException extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    this.code = error.code;
    this.details = error.details;
  }

  // Check if this is an authentication error (401, 403)
  isAuthError(): boolean {
    return this.code === 'HTTP_401' || this.code === 'HTTP_403';
  }

  // Check if this is a network error
  isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'TIMEOUT_ERROR';
  }
}
