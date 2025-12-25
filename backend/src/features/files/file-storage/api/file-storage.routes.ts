import { Router, RequestHandler } from 'express';
import { defaultMemoryUploader } from '@/shared/utils/uploads';
import { FileStorageController } from './FileStorageController';
import { asyncHandler } from '@/shared/middleware/errorHandler';

export const createFileStorageRoutes = (controller: FileStorageController, authMiddleware: RequestHandler) => {
  const router = Router();

  // Use shared default memory uploader instance
  const upload = defaultMemoryUploader;

  // All routes listed below
  // ------------------------------------------------
  // 001. List files (paginated)
  router.get('/', authMiddleware, asyncHandler(controller.listFiles.bind(controller)));
  // 002. Upload a single file
  router.post('/upload', authMiddleware, upload.single('file') as any, asyncHandler(controller.uploadFile.bind(controller)));
  // 003. Download a single file
  router.get('/:fileId/download', asyncHandler(controller.downloadFile.bind(controller))); // Auth handled in controller/service or optional
  // 004. Get metadata for a single file
  router.get('/:fileId/metadata', asyncHandler(controller.getMetadata.bind(controller)));
  // 005. Delete a single file
  router.delete('/:fileId', authMiddleware, asyncHandler(controller.deleteFile.bind(controller)));
  // ------------------------------------------------
  return router;
};
