import type { ApiResponse, ApiError, RequestConfig } from '../types/api';
import { API_BASE_URL, API_TIMEOUT } from '../constants/api';
import { logger, logApiCall } from '../utils/logger';

class ApiClient {
  private baseURL: string;
  private _authToken: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Expose current in-memory token for use in other modules (e.g., downloads)
  getAuthToken(): string | null {
    return this._authToken;
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

  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = '***TOKEN***';
    }
    return sanitized;
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
    const requestId = response.headers.get('X-Request-ID') || undefined;

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
        requestId,
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
      requestId,
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, config?.params);
    const perfLogger = logApiCall(method, endpoint);

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      // Handle FormData differently - don't stringify and don't set Content-Type
      const isFormData = data instanceof FormData;
      const headers = isFormData 
        ? this.getHeaders(config?.headers, true) // Skip default content-type
        : this.getHeaders(config?.headers);
      
      const body = isFormData ? data : (data && method !== 'GET' ? JSON.stringify(data) : undefined);

      // Log request
      logger.debug(`API Request: ${method} ${endpoint}`, {
        url,
        method,
        body: isFormData ? '[FormData]' : data,
        headers: this.sanitizeHeaders(headers),
      });

      const response = await fetch(url, {
        method,
        headers,
        body: body as BodyInit,
        signal: controller.signal,
        credentials: 'include', // include cookies for refresh token flows
        ...config,
      });

      clearTimeout(timeoutId);
      
      const result = await this.handleResponse<T>(response);

      // Log response
      if (result.success) {
        logger.info(`API Success: ${method} ${endpoint}`, {
          status: response.status,
          requestId: result.requestId,
        });
        perfLogger.end({ status: response.status });
      } else {
        logger.warn(`API Error: ${method} ${endpoint}`, {
          status: response.status,
          error: result.error,
          requestId: result.requestId,
        });
        perfLogger.endWithError(
          new Error(`API Error: ${response.status}`),
          { status: response.status, error: result.error }
        );
      }
      
      return result;
    } catch (_error) {
      clearTimeout(timeoutId);
      
      const error = _error as Error;
      
      logger.error(`API Exception: ${method} ${endpoint}`, error, {
        url,
        method,
      });
      perfLogger.endWithError(error);

      if (error.name === 'AbortError') {
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
          message: error.message || 'Network request failed',
        },
      };
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const data = config?.data;
    return this.request<T>('DELETE', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  // Utility method to set auth token
  setAuthToken(token: string | null): void {
    this._authToken = token;
    if (token) {
      logger.debug('Auth token set (in-memory)', { hasToken: true });
    } else {
      logger.debug('Auth token removed (in-memory)');
    }
  }

  // Check if user is authenticated (has a stored token)
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }

  async download(endpoint: string, config?: RequestConfig): Promise<Response> {
    const url = this.buildURL(endpoint, config?.params);
    const method = 'GET';
    const perfLogger = logApiCall(method, endpoint);

    // Create AbortController for manual timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const headers = this.getHeaders(config?.headers);
      
      logger.debug(`API Download Request: ${method} ${endpoint}`, {
        url,
        method,
        headers: this.sanitizeHeaders(headers),
      });

      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        credentials: 'include',
        ...config,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.info(`API Download Success: ${method} ${endpoint}`, {
        status: response.status,
      });
      perfLogger.end({ status: response.status });

      return response;
    } catch (_error) {
      clearTimeout(timeoutId);
      const error = _error as Error;
      
      logger.error(`API Download Exception: ${method} ${endpoint}`, error, {
        url,
        method,
      });
      perfLogger.endWithError(error);
      
      throw new Error(error.message || 'Download failed');
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
