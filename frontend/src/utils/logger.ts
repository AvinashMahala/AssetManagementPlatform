/**
 * 🎨 Frontend Logging System
 * 
 * A comprehensive, browser-friendly logging solution with:
 * - Beautiful console output with colors and emojis (DEV only)
 * - Automatic error capture and reporting
 * - Context tracking (user, page, component)
 * - Performance monitoring
 * - Local storage persistence for critical errors (with consent)
 * - Backend error reporting (with user consent in production)
 * 
 * ⚠️ IMPORTANT: Logging is primarily for development
 * In production, console logging is disabled and backend reporting
 * requires explicit user consent for better UX
 */

import { featureFlags } from './featureFlags';
import { consentManager } from './consentManager';
import { getLoggingConfig } from './loggingConfig';

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  userAgent?: string;
  url?: string;
  componentStack?: string;
}

/**
 * 🎯 Main Frontend Logger Class
 */
class FrontendLogger {
  private static instance: FrontendLogger;
  private logLevel: LogLevel;
  private maxStoredLogs = 100;
  private storageKey = 'app_error_logs';
  private enableBackendReporting = false;
  private backendUrl?: string;

  private constructor() {
    const config = getLoggingConfig();
    this.logLevel = config.level;
    this.maxStoredLogs = 100; // Could be configurable
    this.storageKey = 'app_error_logs';
    this.enableBackendReporting = config.enableBackend;
    this.backendUrl = config.backendUrl;

    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): FrontendLogger {
    if (!FrontendLogger.instance) {
      FrontendLogger.instance = new FrontendLogger();
    }
    return FrontendLogger.instance;
  }

  /**
   * 🔧 Configure logger
   */
  public configure(options: {
    logLevel?: LogLevel;
    enableBackendReporting?: boolean;
    backendUrl?: string;
  }): void {
    if (options.logLevel !== undefined) {
      this.logLevel = options.logLevel;
    }
    
    // Backend reporting requires consent in production
    if (options.enableBackendReporting !== undefined) {
      if (featureFlags.requiresUserConsent()) {
        // Check if user has given consent
        if (consentManager.hasBackendReportingConsent()) {
          this.enableBackendReporting = options.enableBackendReporting;
        } else {
          this.enableBackendReporting = false;
          if (import.meta.env.DEV) {
            console.warn('[Logger] Backend reporting requires user consent in production');
          }
        }
      } else {
        // Development mode - no consent required
        this.enableBackendReporting = options.enableBackendReporting;
      }
    }
    
    if (options.backendUrl) {
      this.backendUrl = options.backendUrl;
    }
  }

  /**
   * 🔵 Debug logging
   */
  public debug(message: string, context?: Record<string, any>): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  /**
   * 🟢 Info logging
   */
  public info(message: string, context?: Record<string, any>): void {
    if (this.logLevel <= LogLevel.INFO) {
      this.log(LogLevel.INFO, message, context);
    }
  }

  /**
   * 🟡 Warning logging
   */
  public warn(message: string, context?: Record<string, any>): void {
    if (this.logLevel <= LogLevel.WARN) {
      this.log(LogLevel.WARN, message, context);
    }
  }

  /**
   * 🔴 Error logging
   */
  public error(message: string, error?: Error | any, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
    
    // Store critical errors
    this.storeError({ message, error, context });
    
    // Report to backend if enabled
    if (this.enableBackendReporting) {
      this.reportToBackend({ message, error, context });
    }
  }

  /**
   * 📝 Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error | any
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (error) {
      logEntry.error = {
        name: error?.name || 'Error',
        message: error?.message || String(error),
        stack: error?.stack,
      };
    }

    // Format and output to console
    this.outputToConsole(logEntry);
  }

  /**
   * 🎨 Output formatted log to console
   */
  private outputToConsole(entry: LogEntry): void {
    const config = getLoggingConfig();

    // Check if console logging is enabled
    if (!config.enableConsole) {
      return;
    }

    const levelInfo = this.getLevelInfo(entry.level);
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    // Build console message
    const prefix = `[${timestamp}] ${levelInfo.emoji} ${levelInfo.label}:`;
    const style = `color: ${levelInfo.color}; font-weight: bold;`;

    // Log message
    console.log(`%c${prefix}`, style, entry.message);

    // Log context if present
    if (entry.context && Object.keys(entry.context).length > 0) {
      console.log('  📦 Context:', entry.context);
    }

    // Log error if present
    if (entry.error) {
      console.log(`  ❌ Error: ${entry.error.name}: ${entry.error.message}`);
      if (entry.error.stack) {
        console.log('  📚 Stack Trace:\n', entry.error.stack);
      }
    }

    // Log additional info
    if (entry.url && import.meta.env.DEV) {
      console.log(`  🌐 URL: ${entry.url}`);
    }
  }

  /**
   * 🎨 Get level styling info
   */
  private getLevelInfo(level: LogLevel): { emoji: string; label: string; color: string } {
    switch (level) {
      case LogLevel.DEBUG:
        return { emoji: '🔵', label: 'DEBUG', color: '#3b82f6' };
      case LogLevel.INFO:
        return { emoji: '🟢', label: 'INFO', color: '#10b981' };
      case LogLevel.WARN:
        return { emoji: '🟡', label: 'WARN', color: '#f59e0b' };
      case LogLevel.ERROR:
        return { emoji: '🔴', label: 'ERROR', color: '#ef4444' };
      default:
        return { emoji: '⚪', label: 'LOG', color: '#6b7280' };
    }
  }

  /**
   * 💾 Store error in local storage
   */
  private storeError(data: { message: string; error?: any; context?: Record<string, any> }): void {
    // Check if local storage logging is enabled
    if (!featureFlags.isLocalStorageLoggingEnabled()) {
      return;
    }

    // Check for user consent in production
    if (featureFlags.requiresUserConsent() && !consentManager.hasLocalStorageConsent()) {
      return;
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      const logs: any[] = stored ? JSON.parse(stored) : [];

      logs.push({
        timestamp: new Date().toISOString(),
        message: data.message,
        error: data.error ? {
          name: data.error.name,
          message: data.error.message,
          stack: data.error.stack,
        } : undefined,
        context: data.context,
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      // Keep only last N logs
      const trimmedLogs = logs.slice(-this.maxStoredLogs);
      localStorage.setItem(this.storageKey, JSON.stringify(trimmedLogs));
    } catch (err) {
      // Silent fail in production, log in development
      if (import.meta.env.DEV) {
        console.error('Failed to store error log:', err);
      }
    }
  }

  /**
   * 📤 Report error to backend
   */
  private async reportToBackend(data: {
    message: string;
    error?: any;
    context?: Record<string, any>;
  }): Promise<void> {
    if (!this.backendUrl) {
      return;
    }

    // Check if backend reporting is enabled
    if (!featureFlags.isBackendReportingEnabled()) {
      return;
    }

    // Check for user consent
    if (!consentManager.hasBackendReportingConsent()) {
      if (import.meta.env.DEV) {
        console.warn('[Logger] Backend reporting requires user consent');
      }
      return;
    }

    try {
      await fetch(`${this.backendUrl}/api/logs/frontend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          message: data.message,
          error: data.error ? {
            name: data.error.name,
            message: data.error.message,
            stack: data.error.stack,
          } : undefined,
          context: data.context,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (err) {
      // Silent fail in production
      if (import.meta.env.DEV) {
        console.error('Failed to report error to backend:', err);
      }
    }
  }

  /**
   * 🌍 Setup global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Uncaught error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', event.reason, {
        promise: 'Promise rejected',
      });
    });
  }

  /**
   * 📊 Get stored error logs
   */
  public getStoredLogs(): any[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to retrieve stored logs:', err);
      return [];
    }
  }

  /**
   * 🗑️ Clear stored logs
   */
  public clearStoredLogs(): void {
    try {
      localStorage.removeItem(this.storageKey);
      this.info('Stored logs cleared');
    } catch (err) {
      console.error('Failed to clear stored logs:', err);
    }
  }

}

// Export singleton instance
export const logger = FrontendLogger.getInstance();

/**
 * 🏷️ Create a page-specific logger
 */
export const createPageLogger = (pageName: string) => {
  return {
    debug: (message: string, context?: Record<string, any>) =>
      logger.debug(message, { page: pageName, ...context }),
    info: (message: string, context?: Record<string, any>) =>
      logger.info(message, { page: pageName, ...context }),
    warn: (message: string, context?: Record<string, any>) =>
      logger.warn(message, { page: pageName, ...context }),
    error: (message: string, error?: Error | any, context?: Record<string, any>) =>
      logger.error(message, error, { page: pageName, ...context }),
    logPageView: (pageNameOverride?: string, context?: Record<string, any>) =>
      logger.info(`Page view: ${pageNameOverride || pageName}`, { page: pageNameOverride || pageName, ...context }),
    logUserInteraction: (action: string, details?: any, context?: Record<string, any>) =>
      logger.info(`User interaction: ${action}`, { page: pageName, action, ...details, ...context }),
  };
};

/**
 * 🧩 Create a component-specific logger
 */
export const createComponentLogger = (componentName: string) => {
  return {
    debug: (message: string, context?: Record<string, any>) =>
      logger.debug(message, { component: componentName, ...context }),
    info: (message: string, context?: Record<string, any>) =>
      logger.info(message, { component: componentName, ...context }),
    warn: (message: string, context?: Record<string, any>) =>
      logger.warn(message, { component: componentName, ...context }),
    error: (message: string, error?: Error | any, context?: Record<string, any>) =>
      logger.error(message, error, { component: componentName, ...context }),
    logComponentMount: (context?: Record<string, any>) =>
      logger.info(`Component mounted: ${componentName}`, { component: componentName, ...context }),
    logComponentUnmount: (context?: Record<string, any>) =>
      logger.info(`Component unmounted: ${componentName}`, { component: componentName, ...context }),
    logUserInteraction: (action: string, details?: any, context?: Record<string, any>) =>
      logger.info(`Component interaction: ${action}`, { component: componentName, action, ...details, ...context }),
  };
};

/**
 * ⏱️ Performance logger helper
 */
export class PerformanceLogger {
  private startTime: number;
  private label: string;
  private context: Record<string, any>;

  constructor(label: string, context?: Record<string, any>) {
    this.label = label;
    this.context = context || {};
    this.startTime = performance.now();
    logger.debug(`⏱️ Starting: ${label}`, this.context);
  }

  public end(additionalContext?: Record<string, any>): void {
    const duration = Math.round(performance.now() - this.startTime);
    logger.info(`✅ Completed: ${this.label}`, {
      ...this.context,
      ...additionalContext,
      duration: `${duration}ms`,
    });
  }

  public endWithError(error: Error, additionalContext?: Record<string, any>): void {
    const duration = Math.round(performance.now() - this.startTime);
    logger.error(`❌ Failed: ${this.label}`, error, {
      ...this.context,
      ...additionalContext,
      duration: `${duration}ms`,
    });
  }
}

/**
 * 🔍 API call logger
 */
export const logApiCall = (
  method: string,
  url: string,
  context?: Record<string, any>
): PerformanceLogger => {
  return new PerformanceLogger(`API ${method} ${url}`, {
    method,
    url,
    ...context,
  });
};

export default logger;
