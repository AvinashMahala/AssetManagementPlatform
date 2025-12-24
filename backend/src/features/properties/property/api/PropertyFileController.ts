import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware';
import { GetPropertyByIdUseCase } from '../core/use-cases/GetPropertyById.usecase.js';
import { FileStorageService } from '@/features/files/file-storage/core/services/FileStorageService';
import { PropertyFileService } from '../core/services/PropertyFileService';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

/**
 * @swagger
 * tags:
 *   name: PropertyFiles
 *   description: Property file management endpoints
 */
export class PropertyFileController {
  constructor(
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private fileStorageService: FileStorageService,
    private propertyFileService: PropertyFileService
  ) {}

  /**
   * @swagger
   * /properties/{propertyId}/files:
   *   post:
   *     summary: Upload a file for a property
   *     tags: [PropertyFiles]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *               - fileType
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *               fileType:
   *                 type: string
   *                 enum: [photo, document]
   *               description:
   *                 type: string
   *               customName:
   *                 type: string
   *     responses:
   *       201:
   *         description: File uploaded successfully
   *       400:
   *         description: Invalid input or missing file
   *       404:
   *         description: Property not found
   *       500:
   *         description: Internal server error
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

  /**
   * @swagger
   * /properties/{propertyId}/files:
   *   get:
   *     summary: Get files for a property
   *     tags: [PropertyFiles]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [photo, document]
   *         description: Filter by file type
   *     responses:
   *       200:
   *         description: List of property files
   *       404:
   *         description: Property not found
   *       500:
   *         description: Internal server error
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

  /**
   * @swagger
   * /properties/{propertyId}/files/{fileId}/download:
   *   get:
   *     summary: Download a property file
   *     tags: [PropertyFiles]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *         description: File ID
   *     responses:
   *       200:
   *         description: File content
   *       404:
   *         description: File or Property not found
   *       500:
   *         description: Internal server error
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

  /**
   * @swagger
   * /properties/files/{fileId}:
   *   put:
   *     summary: Update a property file
   *     tags: [PropertyFiles]
   *     parameters:
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *         description: File ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               fileName:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: File updated successfully
   *       404:
   *         description: File not found
   *       500:
   *         description: Internal server error
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

  /**
   * @swagger
   * /properties/{propertyId}/files/{fileId}:
   *   delete:
   *     summary: Delete a property file
   *     tags: [PropertyFiles]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *         description: File ID
   *     responses:
   *       200:
   *         description: File deleted successfully
   *       404:
   *         description: File or Property not found
   *       500:
   *         description: Internal server error
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
