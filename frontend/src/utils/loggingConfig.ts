/**
 * 🎛️ Centralized Logging Configuration
 *
 * This file provides environment-specific logging configurations
 * and utilities for managing logging behavior across the application.
 */

// import { LogLevel } from './logger';

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export interface LoggingConfig {
  // Core logging settings
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableBackend: boolean;

  // File logging settings
  logDirectory: string;
  maxFileSize: string;
  maxFiles: string;

  // Backend reporting settings
  backendUrl: string;
  backendBatchSize: number;
  backendFlushInterval: number;

  // Performance monitoring
  enablePerformanceLogging: boolean;
  slowQueryThreshold: number; // in milliseconds

  // Error tracking
  enableErrorTracking: boolean;
  enableGlobalErrorHandler: boolean;

  // Privacy and consent
  requireUserConsent: boolean;
  enableLocalStorage: boolean;

  // Development features
  enableDevTools: boolean;
  enableDebugMode: boolean;
}

/**
 * Environment-specific logging configurations
 */
const loggingConfigs: Record<string, LoggingConfig> = {
  development: {
    level: LogLevel.DEBUG,
    enableConsole: true,
    enableFile: true,
    enableBackend: false,

    logDirectory: '../../../logs/frontend',
    maxFileSize: '10m',
    maxFiles: '7d',

    backendUrl: 'http://localhost:3001/api/logs/frontend',
    backendBatchSize: 5,
    backendFlushInterval: 10000, // 10 seconds for faster feedback

    enablePerformanceLogging: true,
    slowQueryThreshold: 100,

    enableErrorTracking: true,
    enableGlobalErrorHandler: true,

    requireUserConsent: false,
    enableLocalStorage: true,

    enableDevTools: true,
    enableDebugMode: true,
  },

  staging: {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: true,
    enableBackend: true,

    logDirectory: '../../../logs/frontend',
    maxFileSize: '20m',
    maxFiles: '14d',

    backendUrl: '/api/logs/frontend',
    backendBatchSize: 10,
    backendFlushInterval: 30000, // 30 seconds

    enablePerformanceLogging: true,
    slowQueryThreshold: 500,

    enableErrorTracking: true,
    enableGlobalErrorHandler: true,

    requireUserConsent: true,
    enableLocalStorage: true,

    enableDevTools: false,
    enableDebugMode: false,
  },

  production: {
    level: LogLevel.WARN,
    enableConsole: false,
    enableFile: true,
    enableBackend: true,

    logDirectory: '../../../logs/frontend',
    maxFileSize: '50m',
    maxFiles: '30d',

    backendUrl: '/api/logs/frontend',
    backendBatchSize: 20,
    backendFlushInterval: 60000, // 1 minute

    enablePerformanceLogging: false,
    slowQueryThreshold: 1000,

    enableErrorTracking: true,
    enableGlobalErrorHandler: true,

    requireUserConsent: true,
    enableLocalStorage: false,

    enableDevTools: false,
    enableDebugMode: false,
  },

  test: {
    level: LogLevel.ERROR,
    enableConsole: false,
    enableFile: false,
    enableBackend: false,

    logDirectory: '../../../logs/test',
    maxFileSize: '1m',
    maxFiles: '1d',

    backendUrl: '',
    backendBatchSize: 1,
    backendFlushInterval: 1000,

    enablePerformanceLogging: false,
    slowQueryThreshold: 100,

    enableErrorTracking: false,
    enableGlobalErrorHandler: false,

    requireUserConsent: false,
    enableLocalStorage: false,

    enableDevTools: false,
    enableDebugMode: false,
  },
};

/**
 * Get the current logging configuration based on environment
 */
export const getLoggingConfig = (): LoggingConfig => {
  const env = (import.meta.env.MODE || 'development') as keyof typeof loggingConfigs;

  // Allow overriding via localStorage in development
  if (env === 'development') {
    try {
      const stored = localStorage.getItem('logging_config');
      if (stored) {
        const overrides = JSON.parse(stored);
        return { ...loggingConfigs[env], ...overrides };
      }
    } catch (error) {
      console.warn('Failed to load logging config overrides:', error);
    }
  }

  return loggingConfigs[env] || loggingConfigs.development;
};

/**
 * Update logging configuration (development only)
 */
export const updateLoggingConfig = (updates: Partial<LoggingConfig>): void => {
  const env = import.meta.env.MODE || 'development';
  if (env !== 'development') {
    console.warn('Logging configuration updates are only allowed in development mode');
    return;
  }

  try {
    const current = getLoggingConfig();
    const updated = { ...current, ...updates };
    localStorage.setItem('logging_config', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to update logging configuration:', error);
  }
};

/**
 * Reset logging configuration to defaults
 */
export const resetLoggingConfig = (): void => {
  try {
    localStorage.removeItem('logging_config');
  } catch (error) {
  }
};

/**
 * Logging presets for quick configuration
 */
export const loggingPresets = {
  silent: {
    level: LogLevel.ERROR,
    enableConsole: false,
    enableFile: false,
    enableBackend: false,
  },

  minimal: {
    level: LogLevel.WARN,
    enableConsole: true,
    enableFile: false,
    enableBackend: false,
  },

  standard: {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: true,
    enableBackend: false,
  },

  verbose: {
    level: LogLevel.DEBUG,
    enableConsole: true,
    enableFile: true,
    enableBackend: true,
    enablePerformanceLogging: true,
  },

  debug: {
    level: LogLevel.DEBUG,
    enableConsole: true,
    enableFile: true,
    enableBackend: true,
    enablePerformanceLogging: true,
    enableDevTools: true,
    enableDebugMode: true,
  },
};

/**
 * Apply a logging preset
 */
export const applyLoggingPreset = (presetName: keyof typeof loggingPresets): void => {
  const preset = loggingPresets[presetName];
  if (preset) {
    updateLoggingConfig(preset);
  } else {
    console.error(`Unknown logging preset: ${presetName}`);
  }
};

/**
 * Development utilities (only available in development)
 */
if (import.meta.env.DEV) {
  // Expose to window for debugging
  (window as any).__loggingConfig = {
    get: getLoggingConfig,
    update: updateLoggingConfig,
    reset: resetLoggingConfig,
    presets: loggingPresets,
    applyPreset: applyLoggingPreset,
  };
}

export default getLoggingConfig;