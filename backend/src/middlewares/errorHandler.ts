/**
 * 🚨 Global Error Handling Middleware
 * 
 * Catches all errors and ensures they are properly logged
 * Never let an error go unlogged!
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

/**
 * Custom error class with additional properties
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 🔴 Global error handler middleware
 * MUST be the last middleware in the chain
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let isOperational = false;

  // Extract error details
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || 'APP_ERROR';
    isOperational = err.isOperational;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log the error with full context
  const errorContext = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.socket.remoteAddress,
    userId: (req as any).user?.id,
    userEmail: (req as any).user?.email,
    statusCode,
    code,
    isOperational,
    query: req.query,
    body: sanitizeBody(req.body),
    params: req.params,
  };

  // Use request logger if available, otherwise use global logger
  if (req.requestLogger) {
    req.requestLogger.error(`❌ Request failed: ${message}`, err, errorContext);
  } else {
    logger.error(`❌ Unhandled error: ${message}`, err, errorContext);
  }

  // End performance tracking if available
  if (req.performanceLogger) {
    req.performanceLogger.endWithError(err, errorContext);
  }

  // Send error response
  const errorResponse: any = {
    success: false,
    error: {
      message,
      code,
    },
  };

  // Add stack trace in development mode
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = errorContext;
  }

  // Add request ID for tracking
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 🔍 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl || req.url}`,
    404,
    true,
    'ROUTE_NOT_FOUND'
  );

  next(error);
};

/**
 * 🔒 Sanitize request body to remove sensitive information
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'creditCard'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * 🎯 Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 💥 Handle uncaught exceptions and unhandled rejections
 */
export const setupProcessErrorHandlers = (): void => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('💥 UNCAUGHT EXCEPTION! Shutting down...', error, {
      type: 'uncaughtException',
    });
    
    // Give time for logs to be written
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('💥 UNHANDLED REJECTION! Shutting down...', reason, {
      type: 'unhandledRejection',
      promise: promise.toString(),
    });
    
    // Give time for logs to be written
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM received. Shutting down gracefully...');
  });

  process.on('SIGINT', () => {
    logger.info('👋 SIGINT received. Shutting down gracefully...');
    process.exit(0);
  });
};
