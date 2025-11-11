import { Request, Response } from 'express';
import { IPropertyService } from '../interfaces/services/IPropertyService.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';

export class PropertyFileController {
  private propertyService: IPropertyService;

  constructor(propertyService: IPropertyService) {
    this.propertyService = propertyService;
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
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - fileName
   *               - fileUrl
   *               - fileType
   *             properties:
   *               fileName:
   *                 type: string
   *                 description: Name of the file
   *               fileUrl:
   *                 type: string
   *                 description: URL where the file is stored
   *               fileType:
   *                 type: string
   *                 enum: [photo, document]
   *                 description: Type of file
   *               description:
   *                 type: string
   *                 description: Optional description of the file
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
      const { fileName, fileUrl, fileType, description } = req.body;

      if (!fileName || !fileUrl || !fileType) {
        return ResponseUtils.badRequest(res, 'fileName, fileUrl, and fileType are required');
      }

      if (!['photo', 'document'].includes(fileType)) {
        return ResponseUtils.badRequest(res, 'fileType must be either "photo" or "document"');
      }

      const file = await this.propertyService.uploadPropertyFile(
        propertyId,
        fileName,
        fileUrl,
        fileType,
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
   * /api/properties/files/{fileId}:
   *   delete:
   *     tags: ['Property Files']
   *     summary: Delete a file
   *     parameters:
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
   *         description: File not found
   */
  async deleteFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const deleted = await this.propertyService.deletePropertyFile(fileId);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'File not found');
      }

      ResponseUtils.success(res, null, 'File deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete file');
    }
  }
}