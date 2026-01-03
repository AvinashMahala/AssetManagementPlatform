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

  /** 001. Upload a file for a property.
   * POST /:propertyId/files — upload a file for the property
   * @param propertyId URL parameter identifying the property (UUID)
   * @body file Multipart form-data file to upload
   * @body fileType Type of the file: 'photo' or 'document'
   * @body description Optional description of the file
   * @body customName Optional custom name for the file
   * @returns JSON response with the uploaded file details or error message
   */
  router.post('/', auth, uploader.single('file') as any, asyncHandler(fileController.uploadFile.bind(fileController)));

  /** 002. Get files for a property.
   * GET /:propertyId/files — list files for the property
   * @param propertyId URL parameter identifying the property (UUID)
   * @query type Optional query parameter to filter files by type: 'photo' or 'document'
   * @returns JSON response with the list of files or error message
   */
  router.get('/', auth, asyncHandler(fileController.getPropertyFiles.bind(fileController)));

  /** 003. Download a property file.
   * GET /:propertyId/files/:fileId/download — download a file
   * @param propertyId URL parameter identifying the property (UUID)
   * @param fileId URL parameter identifying the file (UUID)
   * @returns File download response or error message
   */
  router.get('/:fileId/download', auth, asyncHandler(fileController.downloadFile.bind(fileController)));

  /** 004. Update file metadata.
   * PUT /:fileId — update file metadata
   * @param fileId URL parameter identifying the file (UUID)
   * @body updateData JSON object containing fields to update
   * @returns JSON response with the updated file details or error message
   */
  router.put('/:fileId', auth, asyncHandler(fileController.updateFile.bind(fileController)));

  /** 005. Delete a property file.
   * DELETE /:fileId — delete a file
   * @param fileId URL parameter identifying the file (UUID)
   * @returns JSON response confirming deletion or error message
   */
  router.delete('/:fileId', auth, asyncHandler(fileController.deleteFile.bind(fileController)));

  return router;
};
