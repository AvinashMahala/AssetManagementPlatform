import { Response } from 'express';
import { HTTP_STATUS } from '@/shared/constants/http';
import { logger } from './logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ResponseUtils {
  /**
   * Send a successful response
   */
  static success<T>(res: Response, data: T, message?: string, statusCode: number = HTTP_STATUS.OK): void {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message }),
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   */
  static error(res: Response, message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR, error?: Error): void {
    // Store the error on the request for logging middleware to access
    if (error && res.req) {
      (res.req as any).lastError = error;
    }

    // Log the error if provided
    if (error) {
      // Try to use request logger if available, otherwise use global logger
      const req = res.req;
      if (req?.requestLogger) {
        req.requestLogger.error(`API Error: ${message}`, error, {
          statusCode,
          url: req.originalUrl || req.url,
          method: req.method,
          ip: req.ip,
        });
      } else {
        logger.error(`API Error: ${message}`, error, {
          statusCode,
          url: req?.originalUrl || req?.url,
          method: req?.method,
          ip: req?.ip,
        });
      }
    }

    const response: ApiResponse = {
      success: false,
      error: message,
    };
    res.status(statusCode).json(response);
  }

  /**
   * Send a created response
   */
  static created<T>(res: Response, data: T, message?: string): void {
    this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  /**
   * Send a no content response
   */
  static noContent(res: Response): void {
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Send a not found response
   */
  static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  /**
   * Send a bad request response
   */
  static badRequest(res: Response, message: string): void {
    this.error(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  /**
   * Send a conflict response
   */
  static conflict(res: Response, message: string): void {
    this.error(res, message, HTTP_STATUS.CONFLICT);
  }

  /**
   * Send an unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized access'): void {
    this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  /**
   * Send a forbidden response
   */
  static forbidden(res: Response, message: string = 'Access forbidden'): void {
    this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }
}