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
import { v4 as uuidv4 } from 'uuid';
import { createRequestLogger, PerformanceLogger } from '../utils/logger.js';

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
  const userId = (req as any).user?.id;
  const userEmail = (req as any).user?.email;

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
function logResponse(req: Request, res: Response, body: any): void {
  if (!req.requestLogger || !req.performanceLogger) {
    return;
  }

  const statusCode = res.statusCode;
  const isError = statusCode >= 400;

  // End performance tracking
  if (isError) {
    req.performanceLogger.endWithError(
      new Error(`HTTP ${statusCode}`),
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
