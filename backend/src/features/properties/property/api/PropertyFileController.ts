import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware';
import { GetPropertyByIdUseCase } from '../core/use-cases/GetPropertyById.usecase.js';
import { FileStorageService } from '@/features/files/file-storage/core/services/FileStorageService';
import { PropertyFileService } from '../core/services/PropertyFileService';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

// OpenAPI documentation moved to `src/shared/config/swagger/apis/properties/paths/`
export class PropertyFileController {
  constructor(
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private fileStorageService: FileStorageService,
    private propertyFileService: PropertyFileService
  ) {}

  /** 001. Upload a file for a property.
   * @param req AuthenticatedRequest object containing propertyId in params and file data in body.
   * @param res Response object to send back the result.
   * @returns JSON response with the uploaded file details or error message.
   */
  async uploadFile(req: AuthenticatedRequest, res: Response) {
    try {
      const { propertyId } = req.params;
      const { fileType, description, customName } = req.body;

      if (!req.file) {
        return ResponseUtils.badRequest(res, 'No file uploaded');
      }

      if (!fileType || !['photo', 'document'].includes(fileType)) {
        return ResponseUtils.badRequest(res, 'fileType must be either "photo" or "document"');
      }

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      // Upload file using FileStorageService
      const metadata = {
        entityType: 'property' as const,
        entityId: propertyId,
        filename: customName || req.file.originalname,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        category: fileType,
        uploadedBy: req.user?.id || null
      };

      const fileId = await this.fileStorageService.uploadFile(req.file.buffer, metadata);

      // Create property file record
      const file = await this.propertyFileService.uploadFile(
        propertyId,
        customName || req.file.originalname,
        fileId,
        fileType as 'photo' | 'document',
        description
      );

      ResponseUtils.created(res, file, 'File uploaded successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to upload file');
      }
    }
  }

  /** 002. Get files for a property.
   * @param req Request object containing propertyId in params and optional type in query.
   * @param res Response object to send back the result.
   * @returns JSON response with the list of files or error message.
   */
  async getPropertyFiles(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { type } = req.query;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      let files;
      if (type && ['photo', 'document'].includes(type as string)) {
        files = await this.propertyFileService.getFilesByPropertyIdAndType(propertyId, type as 'photo' | 'document');
      } else {
        files = await this.propertyFileService.getFilesByPropertyId(propertyId);
      }

      ResponseUtils.success(res, files);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property files');
    }
  }

  /** 003. Download a property file.
   * @param req AuthenticatedRequest object containing propertyId and fileId in params.
   * @param res Response object to send back the file or error message.
   * @returns File download response or error message.
   */
  async downloadFile(req: AuthenticatedRequest, res: Response) {
    try {
      const { propertyId, fileId } = req.params;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const file = await this.propertyFileService.getFileById(fileId);
      if (!file) {
        return ResponseUtils.notFound(res, 'File record not found');
      }

      // Get file buffer from storage service
      const fileBuffer = await this.fileStorageService.downloadFile(file.fileId, req.user?.id || 'system');
      
      res.setHeader('Content-Type', file.fileType === 'photo' ? 'image/jpeg' : 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
      
      res.send(fileBuffer);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to download file');
    }
  }

  /** 004. Update file metadata.
   * @param req Request object containing fileId in params and update data in body.
   * @param res Response object to send back the result.
   * @returns JSON response with the updated file details or error message.
   */
  async updateFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const updates = req.body;

      const file = await this.propertyFileService.updateFile(fileId, updates);
      if (!file) {
        return ResponseUtils.notFound(res, 'File not found');
      }

      ResponseUtils.success(res, file, 'File updated successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update file');
    }
  }

  /** 005. Delete a property file.
   * @param req Request object containing propertyId and fileId in params.
   * @param res Response object to send back the result.
   * @returns JSON response confirming deletion or error message.
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { propertyId, fileId } = req.params;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const file = await this.propertyFileService.getFileById(fileId);
      if (!file) {
        return ResponseUtils.notFound(res, 'File not found');
      }

      // Delete from storage first
      await this.fileStorageService.deleteFile(file.fileId);

      // Delete record
      await this.propertyFileService.deleteFile(fileId);

      ResponseUtils.success(res, null, 'File deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete file');
    }
  }
}
