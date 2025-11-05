/**
 * 🌐 API Service with Integrated Logging
 * 
 * Enhanced API service that automatically logs all requests and responses
 */

import { logger, logApiCall } from './logger';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  requestId?: string;
}

class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 🔧 Set authentication token
   */
  public setAuthToken(token: string | null): void {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
      logger.debug('Auth token set', { hasToken: true });
    } else {
      delete this.defaultHeaders['Authorization'];
      logger.debug('Auth token removed');
    }
  }

  /**
   * 📡 Make API request with logging
   */
  public async request<T = any>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = config.method || 'GET';
    
    // Start performance logging
    const perfLogger = logApiCall(method, endpoint);

    try {
      // Prepare request
      const headers = {
        ...this.defaultHeaders,
        ...config.headers,
      };

      const requestConfig: RequestInit = {
        method,
        headers,
        signal: config.signal,
      };

      if (config.body && method !== 'GET') {
        requestConfig.body = JSON.stringify(config.body);
      }

      // Log request
      logger.debug(`API Request: ${method} ${endpoint}`, {
        url,
        method,
        body: config.body,
        headers: this.sanitizeHeaders(headers),
      });

      // Make request
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      // Log response
      if (response.ok) {
        logger.info(`API Success: ${method} ${endpoint}`, {
          status: response.status,
          requestId: response.headers.get('X-Request-ID'),
        });
        perfLogger.end({ status: response.status });
        
        return {
          success: true,
          data,
          requestId: response.headers.get('X-Request-ID') || undefined,
        };
      } else {
        logger.warn(`API Error: ${method} ${endpoint}`, {
          status: response.status,
          error: data,
          requestId: response.headers.get('X-Request-ID'),
        });
        perfLogger.endWithError(
          new Error(`API Error: ${response.status}`),
          { status: response.status, error: data }
        );
        
        return {
          success: false,
          error: {
            message: data.error?.message || 'Request failed',
            code: data.error?.code,
            details: data.error,
          },
          requestId: response.headers.get('X-Request-ID') || undefined,
        };
      }
    } catch (error) {
      logger.error(`API Exception: ${method} ${endpoint}`, error as Error, {
        url,
        method,
      });
      perfLogger.endWithError(error as Error);

      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Network error',
          code: 'NETWORK_ERROR',
        },
      };
    }
  }

  /**
   * 🔒 Sanitize headers for logging
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };
    if (sanitized.Authorization) {
      sanitized.Authorization = '***TOKEN***';
    }
    return sanitized;
  }

  /**
   * 🟢 GET request
   */
  public async get<T = any>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * 🟡 POST request
   */
  public async post<T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  /**
   * 🟠 PUT request
   */
  public async put<T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  /**
   * 🔵 PATCH request
   */
  public async patch<T = any>(
    endpoint: string,
    body?: any,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  /**
   * 🔴 DELETE request
   */
  public async delete<T = any>(
    endpoint: string,
    config?: Omit<ApiRequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

// Export singleton instance
export const apiService = new ApiService();

export default apiService;
