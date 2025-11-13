import type { ApiResponse, ApiError, RequestConfig } from '../types/api';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    // Add cache control to prevent 304 responses
    headers['Cache-Control'] = 'no-cache';
    headers['Pragma'] = 'no-cache';

    // Handle additional headers
    if (additionalHeaders) {
      Object.assign(headers, additionalHeaders);
    }

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private buildURL(endpoint: string, params?: Record<string, unknown>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let responseData: unknown;

    try {
      const contentType = response.headers.get('content-type');
      // HTTP 304 Not Modified typically has no body
      if (response.status === 304) {
        responseData = null;
      } else if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (_error) {
      responseData = null;
    }

    if (response.ok || response.status === 304) {
      // Backend returns {success: true, data: {...}}
      // Extract the data field from the backend response
      const backendResponse = responseData as { success?: boolean; data?: T; message?: string };
      
      return {
        success: true,
        data: backendResponse?.data || (responseData as T),
        message: backendResponse?.message,
      };
    }

    // Handle error responses
    const errorData = responseData as { error?: string | { code?: string; message?: string; details?: unknown }; message?: string };
    let errorMessage: string;
    
    if (typeof errorData?.error === 'string') {
      // Backend sends { success: false, error: "error message" }
      errorMessage = errorData.error;
    } else if (errorData?.error?.message) {
      // Backend sends { success: false, error: { message: "error message" } }
      errorMessage = errorData.error.message;
    } else if (errorData?.message) {
      // Fallback to message field
      errorMessage = errorData.message;
    } else {
      // Final fallback to HTTP status
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    const error: ApiError = {
      code: (typeof errorData?.error === 'object' ? errorData.error.code : undefined) || `HTTP_${response.status}`,
      message: errorMessage,
      details: (typeof errorData?.error === 'object' ? errorData.error.details : undefined) as Record<string, unknown> | undefined,
    };

    return {
      success: false,
      error,
    };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);
    
    console.log('[apiClient.get] URL:', url);
    console.log('[apiClient.get] Headers:', this.getHeaders(config?.headers));

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(config?.headers),
        signal: controller.signal,
        ...config,
      });

      clearTimeout(timeoutId);
      
      console.log('[apiClient.get] Response status:', response.status);
      console.log('[apiClient.get] Response ok:', response.ok);
      
      const result = await this.handleResponse<T>(response);
      console.log('[apiClient.get] Handled response:', result);
      
      return result;
    } catch (_error) {
      clearTimeout(timeoutId);
      
      if (_error instanceof Error && _error.name === 'AbortError') {
        console.error('[apiClient.get] Request timed out after', API_TIMEOUT, 'ms');
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: `Request timed out after ${API_TIMEOUT}ms`,
          },
        };
      }
      
      console.error('[apiClient.get] Error:', _error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: _error instanceof Error ? _error.message : 'Network request failed',
        },
      };
    }
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(config?.headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        ...config,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (_error) {
      clearTimeout(timeoutId);
      
      if (_error instanceof Error && _error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: `Request timed out after ${API_TIMEOUT}ms`,
          },
        };
      }
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: _error instanceof Error ? _error.message : 'Network request failed',
        },
      };
    }
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(config?.headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        ...config,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (_error) {
      clearTimeout(timeoutId);
      
      if (_error instanceof Error && _error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: `Request timed out after ${API_TIMEOUT}ms`,
          },
        };
      }
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: _error instanceof Error ? _error.message : 'Network request failed',
        },
      };
    }
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    console.log('[apiClient.delete] URL:', url);
    console.log('[apiClient.delete] Headers:', this.getHeaders(config?.headers));
    console.log('[apiClient.delete] Config data:', config?.data);

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(config?.headers),
        body: config?.data ? JSON.stringify(config.data) : undefined,
        signal: controller.signal,
        ...config,
      });

      clearTimeout(timeoutId);
      
      console.log('[apiClient.delete] Response status:', response.status);
      console.log('[apiClient.delete] Response ok:', response.ok);
      
      const result = await this.handleResponse<T>(response);
      console.log('[apiClient.delete] Handled response:', result);
      
      return result;
    } catch (_error) {
      clearTimeout(timeoutId);
      
      if (_error instanceof Error && _error.name === 'AbortError') {
        console.error('[apiClient.delete] Request timed out after', API_TIMEOUT, 'ms');
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: `Request timed out after ${API_TIMEOUT}ms`,
          },
        };
      }
      
      console.error('[apiClient.delete] Error:', _error);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: _error instanceof Error ? _error.message : 'Network request failed',
        },
      };
    }
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(config?.headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        ...config,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (_error) {
      clearTimeout(timeoutId);
      
      if (_error instanceof Error && _error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: `Request timed out after ${API_TIMEOUT}ms`,
          },
        };
      }
      
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: _error instanceof Error ? _error.message : 'Network request failed',
        },
      };
    }
  }

  // Utility method to set auth token
  setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Check if user is authenticated (has a stored token)
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }

  async download(endpoint: string, config?: RequestConfig): Promise<Response> {
    const url = this.buildURL(endpoint, config?.params);

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(config?.headers),
        signal: controller.signal,
        ...config,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (_error) {
      clearTimeout(timeoutId);
      throw new Error(_error instanceof Error ? _error.message : 'Download failed');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;