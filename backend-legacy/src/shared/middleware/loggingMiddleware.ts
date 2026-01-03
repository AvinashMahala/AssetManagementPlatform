/**
 * 🌐 HTTP Request Logging Middleware
 * 
 * Automatically logs all HTTP requests with:
 * - Request ID for correlation
 * - Method, URL, IP address
 * - Response status and time
 * - User information (if authenticated)
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware';
import { v4 as uuidv4 } from 'uuid';
import { createRequestLogger, PerformanceLogger } from '@/shared/utils/logger.js';

// Extend Express Request type to include our custom properties
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      requestLogger?: ReturnType<typeof createRequestLogger>;
      performanceLogger?: PerformanceLogger;
    }
  }
}

/**
 * 📝 Request logging middleware
 */
export const requestLoggingMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate unique request ID
  const requestId = uuidv4();
  req.requestId = requestId;

  // Get user info if authenticated
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id;
  const userEmail = authReq.user?.email;

  // Create request-specific logger
  req.requestLogger = createRequestLogger({
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.socket.remoteAddress,
    userId,
    userEmail,
  });

  // Start performance tracking
  req.performanceLogger = new PerformanceLogger(
    `${req.method} ${req.originalUrl || req.url}`,
    {
      requestId,
      userId,
    }
  );

  // Log incoming request
  req.requestLogger.http('Incoming request', {
    headers: {
      'user-agent': req.headers['user-agent'],
      'content-type': req.headers['content-type'],
    },
    query: req.query,
    body: sanitizeBody(req.body),
  });

  // Capture the original res.json and res.send to log response
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function (body: any) {
    logResponse(req, res, body);
    return originalJson(body);
  };

  res.send = function (body: any) {
    logResponse(req, res, body);
    return originalSend(body);
  };

  next();
};

/**
 * 🚨 Error logging middleware
 * Must be placed after all other middleware but before error handlers
 */
export const errorLoggingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error with full details
  if (req.requestLogger) {
    req.requestLogger.error('Unhandled error occurred', error, {
      url: req.originalUrl || req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      body: sanitizeBody(req.body),
      query: req.query,
      params: req.params,
    });
  }

  // Log performance failure if tracking was started
  if (req.performanceLogger) {
    req.performanceLogger.endWithError(error, {
      errorType: 'unhandled',
      statusCode: res.statusCode || 500,
    });
  }

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
 * 📤 Log response
 */
function logResponse(req: Request, res: Response, body: any, error?: Error): void {
  if (!req.requestLogger || !req.performanceLogger) {
    return;
  }

  const statusCode = res.statusCode;
  const isError = statusCode >= 400;

  // Use the stored error from ResponseUtils.error if available, otherwise use provided error or create generic one
  const errorToLog = (req as any).lastError || error || (isError ? new Error(`HTTP ${statusCode}`) : undefined);

  // End performance tracking
  if (isError) {
    req.performanceLogger.endWithError(
      errorToLog,
      {
        statusCode,
        responseBody: typeof body === 'object' ? body : undefined,
      }
    );
  } else {
    req.performanceLogger.end({
      statusCode,
    });
  }

  // Log response
  const logMethod = isError ? 'warn' : 'http';
  req.requestLogger[logMethod]('Response sent', {
    statusCode,
    statusMessage: res.statusMessage,
  });
}

/**
 * 🎯 Add request ID to response headers
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.requestId) {
    res.setHeader('X-Request-ID', req.requestId);
  }
  next();
};
