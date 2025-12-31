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

  // If server returned validation errors, return them as a field->messages map
  getFieldErrors(): Record<string, string[]> | undefined {
    const d = this.details as any;
    if (!d) return undefined;
    if (Array.isArray(d.errors)) {
      const map: Record<string, string[]> = {};
      for (const item of d.errors) {
        if (!item || !item.field) continue;
        map[item.field] = item.errors || [];
      }
      return map;
    }
    return undefined;
  }
}
