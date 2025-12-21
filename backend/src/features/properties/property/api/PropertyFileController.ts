import { Request, Response } from 'express';
import { GetPropertyByIdUseCase } from '../core/use-cases/GetPropertyById.usecase.js';
import { FileStorageService } from '@/services/FileStorageService.js';
import { IPropertyFileService } from '@/interfaces/services/IPropertyFileService.js';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

export class PropertyFileController {
  constructor(
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private fileStorageService: FileStorageService,
    private propertyFileService: IPropertyFileService
  ) {}

  async uploadFile(req: Request, res: Response) {
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
        uploadedBy: (req as any).user?.id || null
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
        files = await this.propertyFileService.getFilesByPropertyAndType(propertyId, type as 'photo' | 'document');
      } else {
        files = await this.propertyFileService.getFilesByProperty(propertyId);
      }

      ResponseUtils.success(res, files);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property files');
    }
  }

  async downloadFile(req: Request, res: Response) {
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
      const fileBuffer = await this.fileStorageService.downloadFile(file.fileId, (req as any).user?.id || 'system');
      
      res.setHeader('Content-Type', file.fileType === 'photo' ? 'image/jpeg' : 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
      
      res.send(fileBuffer);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to download file');
    }
  }

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
