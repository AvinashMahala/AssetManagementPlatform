/**
 * 🎨 Centralized Logging System
 * 
 * A comprehensive, developer-friendly logging solution with:
 * - Beautiful, formatted console output with colors
 * - Automatic file rotation (daily)
 * - Separate logs for different levels
 * - Request tracking with correlation IDs
 * - Performance monitoring
 * - Error stack traces
 * - Metadata enrichment
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels with priorities
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(logColors);

// Determine log level based on environment
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

/**
 * 🎨 Custom format for beautiful console output
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      // Remove empty objects and internal Winston properties
      const cleanMeta = Object.fromEntries(
        Object.entries(meta).filter(([key, value]) => 
          !['Symbol(level)', 'Symbol(splat)'].includes(key) &&
          value !== undefined &&
          value !== null &&
          !(typeof value === 'object' && Object.keys(value).length === 0)
        )
      );
      
      if (Object.keys(cleanMeta).length > 0) {
        logMessage += `\n  📦 Metadata: ${JSON.stringify(cleanMeta, null, 2)}`;
      }
    }
    
    // Add stack trace for errors
    if (info.stack) {
      logMessage += `\n  📚 Stack Trace:\n${info.stack}`;
    }
    
    return logMessage;
  })
);

/**
 * 📁 Custom format for file output (JSON for easy parsing)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * 🗂️ Daily rotate file transport factory
 */
const createRotateTransport = (filename: string, level: string) => {
  return new DailyRotateFile({
    filename: path.join(__dirname, '../../../logs/backend', `${filename}-%DATE%.log`),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: fileFormat,
  });
};

/**
 * 🎯 Main Logger Configuration
 */
class Logger {
  private logger: winston.Logger;
  private static instance: Logger;

  private constructor() {
    this.logger = winston.createLogger({
      levels: logLevels,
      level: getLogLevel(),
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: consoleFormat,
        }),
        
        // All logs combined
        createRotateTransport('combined', 'debug'),
        
        // Error logs only
        createRotateTransport('error', 'error'),
        
        // Warning logs
        createRotateTransport('warn', 'warn'),
        
        // HTTP request logs
        createRotateTransport('http', 'http'),
        
        // Info logs
        createRotateTransport('info', 'info'),
      ],
      
      // Handle exceptions and rejections
      exceptionHandlers: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        createRotateTransport('exceptions', 'error'),
      ],
      
      rejectionHandlers: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
        createRotateTransport('rejections', 'error'),
      ],
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * 🔵 Debug level logging
   */
  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(message, meta);
  }

  /**
   * 🟢 Info level logging
   */
  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(message, meta);
  }

  /**
   * 🟡 Warning level logging
   */
  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(message, meta);
  }

  /**
   * 🔴 Error level logging
   */
  public error(message: string, error?: Error | any, meta?: Record<string, any>): void {
    const errorMeta = {
      ...meta,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    
    this.logger.error(message, errorMeta);
  }

  /**
   * 🌐 HTTP request logging
   */
  public http(message: string, meta?: Record<string, any>): void {
    this.logger.http(message, meta);
  }

  /**
   * 🎯 Log with custom level
   */
  public log(level: string, message: string, meta?: Record<string, any>): void {
    this.logger.log(level, message, meta);
  }

  /**
   * 📊 Create a child logger with default metadata
   */
  public child(defaultMeta: Record<string, any>): winston.Logger {
    return this.logger.child(defaultMeta);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

/**
 * 🏷️ Create a module-specific logger
 */
export const createModuleLogger = (moduleName: string) => {
  return {
    debug: (message: string, meta?: Record<string, any>) => 
      logger.debug(message, { module: moduleName, ...meta }),
    info: (message: string, meta?: Record<string, any>) => 
      logger.info(message, { module: moduleName, ...meta }),
    warn: (message: string, meta?: Record<string, any>) => 
      logger.warn(message, { module: moduleName, ...meta }),
    error: (message: string, error?: Error | any, meta?: Record<string, any>) => 
      logger.error(message, error, { module: moduleName, ...meta }),
    http: (message: string, meta?: Record<string, any>) => 
      logger.http(message, { module: moduleName, ...meta }),
  };
};

/**
 * ⏱️ Performance logger helper
 */
export class PerformanceLogger {
  private startTime: number;
  private label: string;
  private meta: Record<string, any>;

  constructor(label: string, meta?: Record<string, any>) {
    this.label = label;
    this.meta = meta || {};
    this.startTime = Date.now();
    logger.debug(`⏱️ Starting: ${label}`, this.meta);
  }

  public end(additionalMeta?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;
    logger.info(`✅ Completed: ${this.label}`, {
      ...this.meta,
      ...additionalMeta,
      duration: `${duration}ms`,
    });
  }

  public endWithError(error: Error, additionalMeta?: Record<string, any>): void {
    const duration = Date.now() - this.startTime;
    logger.error(`❌ Failed: ${this.label}`, error, {
      ...this.meta,
      ...additionalMeta,
      duration: `${duration}ms`,
    });
  }
}

/**
 * 🔍 Request context logger
 */
export interface RequestContext {
  requestId: string;
  method: string;
  url: string;
  ip?: string;
  userId?: string;
  userEmail?: string;
}

export const createRequestLogger = (context: RequestContext) => {
  const baseContext = {
    requestId: context.requestId,
    method: context.method,
    url: context.url,
    ip: context.ip,
    userId: context.userId,
    userEmail: context.userEmail,
  };

  return {
    debug: (message: string, meta?: Record<string, any>) => 
      logger.debug(message, { ...baseContext, ...meta }),
    info: (message: string, meta?: Record<string, any>) => 
      logger.info(message, { ...baseContext, ...meta }),
    warn: (message: string, meta?: Record<string, any>) => 
      logger.warn(message, { ...baseContext, ...meta }),
    error: (message: string, error?: Error | any, meta?: Record<string, any>) => 
      logger.error(message, error, { ...baseContext, ...meta }),
    http: (message: string, meta?: Record<string, any>) => 
      logger.http(message, { ...baseContext, ...meta }),
  };
};

export default logger;
