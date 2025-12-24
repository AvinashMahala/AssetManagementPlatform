import { Router, RequestHandler } from 'express';
import { defaultMemoryUploader } from '@/shared/utils/uploads';
import { FileStorageController } from './FileStorageController';
import { asyncHandler } from '@/shared/middleware/errorHandler';

export const createFileStorageRoutes = (controller: FileStorageController, authMiddleware: RequestHandler) => {
  const router = Router();

  // Use shared default memory uploader instance
  const upload = defaultMemoryUploader;

  router.post('/upload', authMiddleware, upload.single('file') as any, asyncHandler(controller.uploadFile.bind(controller)));
  // List files (paginated)
  router.get('/', authMiddleware, asyncHandler(controller.listFiles.bind(controller)));
  // File metadata
  router.get('/:fileId/metadata', asyncHandler(controller.getMetadata.bind(controller)));
  router.get('/:fileId/download', asyncHandler(controller.downloadFile.bind(controller))); // Auth handled in controller/service or optional
  // Delete a file
  router.delete('/:fileId', authMiddleware, asyncHandler(controller.deleteFile.bind(controller)));

  return router;
};
