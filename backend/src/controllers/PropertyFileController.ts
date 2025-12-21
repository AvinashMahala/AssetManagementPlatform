import { Request, Response } from 'express';
import { IPropertyService } from '../interfaces/services/IPropertyService.js';
import { FileStorageService } from '../services/FileStorageService.js';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

export class PropertyFileController {
  private propertyService: IPropertyService;
  private fileStorageService: FileStorageService;

  constructor(propertyService: IPropertyService, fileStorageService: FileStorageService) {
    this.propertyService = propertyService;
    this.fileStorageService = fileStorageService;
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/files:
   *   post:
   *     tags: ['Property Files']
   *     summary: Upload a file for a property
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
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *                 description: File to upload
   *               fileType:
   *                 type: string
   *                 enum: [photo, document]
   *                 description: Type of file
   *               description:
   *                 type: string
   *                 description: Optional description of the file
   *               customName:
   *                 type: string
   *                 description: Optional custom name for the file
   *     responses:
   *       201:
   *         description: File uploaded successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PropertyFile'
   *       404:
   *         description: Property not found
   */
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

      // Create property file record with fileId reference
      const file = await this.propertyService.uploadPropertyFile(
        propertyId,
        customName || req.file.originalname,
        fileId, // Store fileId instead of URL
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
   * /api/properties/{propertyId}/files:
   *   get:
   *     tags: ['Property Files']
   *     summary: Get all files for a property
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *       - in: query
   *         name: fileType
   *         schema:
   *           type: string
   *           enum: [photo, document]
   *         description: Filter by file type
   *     responses:
   *       200:
   *         description: List of property files
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/PropertyFile'
   *       404:
   *         description: Property not found
   */
  async getPropertyFiles(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { fileType } = req.query;

      let files;
      if (fileType && ['photo', 'document'].includes(fileType as string)) {
        files = await this.propertyService.getPropertyFilesByType(propertyId, fileType as 'photo' | 'document');
      } else {
        files = await this.propertyService.getPropertyFiles(propertyId);
      }

      ResponseUtils.success(res, files);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to fetch property files');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/files/{fileId}:
   *   put:
   *     tags: ['Property Files']
   *     summary: Update file information
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
   *                 description: New file name
   *               description:
   *                 type: string
   *                 description: New file description
   *     responses:
   *       200:
   *         description: File updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PropertyFile'
   *       404:
   *         description: File not found
   */
  async updateFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;
      const { fileName, description } = req.body;

      const file = await this.propertyService.updatePropertyFile(fileId, { fileName, description });
      if (!file) {
        return ResponseUtils.notFound(res, 'File not found');
      }

      ResponseUtils.success(res, file, 'File updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('cannot be') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update file');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/files/{fileId}:
   *   delete:
   *     tags: ['Property Files']
   *     summary: Delete a file from a property
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
   *         description: File not found or does not belong to the property
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { propertyId, fileId } = req.params;

      // First verify the file belongs to the property
      const propertyFiles = await this.propertyService.getPropertyFiles(propertyId);
      const propertyFile = propertyFiles.find(f => f.id === fileId);

      if (!propertyFile) {
        return ResponseUtils.notFound(res, 'File not found or does not belong to this property');
      }

      const deleted = await this.propertyService.deletePropertyFile(fileId);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'File not found');
      }

      ResponseUtils.success(res, null, 'File deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete file');
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/files/{fileId}/download:
   *   get:
   *     tags: ['Property Files']
   *     summary: Download a property file
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: fileId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: File downloaded successfully
   *       404:
   *         description: File not found
   *       500:
   *         description: Server error
   */
  async downloadFile(req: Request, res: Response) {
    try {
      const { propertyId, fileId } = req.params;

      // First, get the property file record to verify it exists and get the fileId
      const propertyFiles = await this.propertyService.getPropertyFiles(propertyId);
      const propertyFile = propertyFiles.find(f => f.id === fileId);

      if (!propertyFile) {
        return ResponseUtils.notFound(res, 'Property file not found');
      }

      // Use FileStorageService to download the actual file
      // @ts-ignore - req.user is added by auth middleware
      const userId = req.user?.id;
      console.log('DEBUG: req.user:', req.user);
      console.log('DEBUG: userId:', userId);
      if (!userId) {
        console.log('DEBUG: User not authenticated, returning 401');
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }
      console.log('DEBUG: Calling downloadFile with userId:', userId);
      const fileBuffer = await this.fileStorageService.downloadFile(propertyFile.fileId, userId);

      // Get file metadata to determine content type
      const metadata = await this.fileStorageService.getFileMetadata(propertyFile.fileId);

      // Set appropriate headers
      res.setHeader('Content-Type', metadata?.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${propertyFile.fileName}"`);

      // Send the file buffer
      res.send(fileBuffer);

    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found')) {
        ResponseUtils.notFound(res, 'File not found');
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to download file');
      }
    }
  }
}