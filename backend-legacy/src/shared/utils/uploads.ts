import multer from 'multer';
import { config } from '@/shared/config/env';

/**
 * Options for the memory uploader factory
 */
export interface MemoryUploadOptions {
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
}

/**
 * Create a multer instance that stores files in memory with sensible defaults.
 *
 * - Default maxFileSizeBytes: 50 MB
 * - Default allowedMimeTypes: common image/document types
 *
 * This helper centralizes upload configuration so multiple modules can
 * reuse the same policy and it can be unit-tested in one place.
 */
export function createMemoryUploader(options: MemoryUploadOptions = {}) {
  const { maxFileSizeBytes = config.fileUpload.maxFileSizeBytes ?? 50 * 1024 * 1024, allowedMimeTypes } = options;

  const defaultAllowed = options.allowedMimeTypes ?? config.fileUpload.allowedMimeTypes ?? [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'text/markdown'
  ];

  const allowed = allowedMimeTypes ?? defaultAllowed;

  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSizeBytes },
    fileFilter: (req: any, file: any, cb: any) => {
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`File type ${file.mimetype} not allowed`));
      }
    }
  });
}

/**
 * Default 50MB memory uploader instance
 */
export const defaultMemoryUploader = createMemoryUploader();
