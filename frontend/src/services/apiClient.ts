import type { ApiResponse, ApiError, RequestConfig } from '../types/api';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return sessionStorage.getItem('token');
  }

  private getHeaders(additionalHeaders?: Record<string, string>, skipContentType?: boolean): Record<string, string> {
    const headers: Record<string, string> = {};

    // Only set default content-type if not skipping
    if (!skipContentType) {
      headers['Content-Type'] = 'application/json';
    }

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
      
      
      const result = await this.handleResponse<T>(response);
      
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
      // Handle FormData differently - don't stringify and don't set Content-Type
      const isFormData = data instanceof FormData;
      const headers = isFormData 
        ? this.getHeaders(config?.headers, true) // Skip default content-type
        : this.getHeaders(config?.headers);
      const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
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
      // Handle FormData differently - don't stringify and don't set Content-Type
      const isFormData = data instanceof FormData;
      const headers = isFormData 
        ? this.getHeaders(config?.headers, true) // Skip default content-type
        : this.getHeaders(config?.headers);
      const body = isFormData ? data : (data ? JSON.stringify(data) : undefined);

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body,
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

      const result = await this.handleResponse<T>(response);
      
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
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
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