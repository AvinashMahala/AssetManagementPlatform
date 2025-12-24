import { Router, RequestHandler } from 'express';
import { IPropertyFileController } from '../types';
import { defaultMemoryUploader } from '@/shared/utils/uploads';
import { asyncHandler } from '@/shared/middleware/errorHandler';

/**
 * Creates a sub-router for property file operations.
 * Mounted at '/:propertyId/files' by the parent router.
 */
export const createPropertyFilesRouter = (fileController: IPropertyFileController, auth: RequestHandler, uploader = defaultMemoryUploader) => {
  const router = Router({ mergeParams: true });

  // POST /:propertyId/files — upload single file
  router.post('/', auth, uploader.single('file') as any, asyncHandler(fileController.uploadFile.bind(fileController)));

  // GET /:propertyId/files — list files for the property
  router.get('/', auth, asyncHandler(fileController.getPropertyFiles.bind(fileController)));

  // GET /:propertyId/files/:fileId/download — download a file
  router.get('/:fileId/download', auth, asyncHandler(fileController.downloadFile.bind(fileController)));

  // PUT /:fileId — update file metadata
  router.put('/:fileId', auth, asyncHandler(fileController.updateFile.bind(fileController)));

  // DELETE /:fileId — delete a file
  router.delete('/:fileId', auth, asyncHandler(fileController.deleteFile.bind(fileController)));

  return router;
};
