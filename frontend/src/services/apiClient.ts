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

  private buildURL(endpoint: string, params?: Record<string, any>): string {
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
    let data: any;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      data = null;
    }

    if (response.ok) {
      return {
        success: true,
        data: data,
        message: data?.message,
      };
    }

    // Handle error responses
    const error: ApiError = {
      code: data?.error?.code || `HTTP_${response.status}`,
      message: data?.error?.message || data?.message || `HTTP ${response.status}: ${response.statusText}`,
      details: data?.error?.details,
    };

    return {
      success: false,
      error,
    };
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(config?.headers),
        signal: AbortSignal.timeout(API_TIMEOUT),
        ...config,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(config?.headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(API_TIMEOUT),
        ...config,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(config?.headers),
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(API_TIMEOUT),
        ...config,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
        },
      };
    }
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(config?.headers),
        signal: AbortSignal.timeout(API_TIMEOUT),
        ...config,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network request failed',
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

  // Utility method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;