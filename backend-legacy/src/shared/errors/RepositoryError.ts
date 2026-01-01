import { AppError } from '@/shared/middleware/errorHandler.js';
import { logger } from '@/shared/utils/logger.js';

/**
 * RepositoryError represents failures at the data/repository layer.
 * It extends AppError so it can be recognized by the global error handler
 * and carry an error code for higher-level handling.
 */
export class RepositoryError extends AppError {
  constructor(
    message: string,
    code: string = 'REPOSITORY_ERROR',
    original?: Error,
    meta?: Record<string, any>
  ) {
    // Mark repository errors as internal server errors and non-operational by default
    super(message, 500, false, code);

    if (original?.stack) {
      // Preserve original stack for better debugging
      this.stack = original.stack;
    }

    // Log immediately with structured context so repository failures are visible
    try {
      logger.error(message, original, { code, layer: 'repository', ...meta });
    } catch (logError) {
      // Swallow logging errors to avoid masking original error
      // eslint-disable-next-line no-console
      console.error('Failed to log RepositoryError', logError);
    }
  }
}
