import { Response } from 'express';
import { ResponseUtils } from './response';
import { HTTP_STATUS } from '../constants/http';

export class ErrorUtils {
  /**
   * Handle database errors
   */
  static handleDatabaseError(res: Response, error: any): void {
    console.error('Database error:', error);

    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint?.includes('username')) {
        return ResponseUtils.conflict(res, 'Username already exists');
      }
      if (error.constraint?.includes('email')) {
        return ResponseUtils.conflict(res, 'Email already exists');
      }
      return ResponseUtils.conflict(res, 'Resource already exists');
    }

    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return ResponseUtils.error(res, 'Database connection failed', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
    }

    // Default database error
    return ResponseUtils.error(res, 'Database operation failed', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(res: Response, message: string): void {
    ResponseUtils.badRequest(res, message);
  }

  /**
   * Handle not found errors
   */
  static handleNotFound(res: Response, resource: string = 'Resource'): void {
    ResponseUtils.notFound(res, `${resource} not found`);
  }

  /**
   * Handle generic errors
   */
  static handleGenericError(res: Response, error: any, defaultMessage: string = 'An error occurred'): void {
    console.error('Unhandled error:', error);
    ResponseUtils.error(res, defaultMessage, HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }

  /**
   * Wrap async route handlers to catch errors
   */
  static asyncHandler(fn: Function) {
    return (req: any, res: Response, next: any) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        this.handleGenericError(res, error);
      });
    };
  }
}