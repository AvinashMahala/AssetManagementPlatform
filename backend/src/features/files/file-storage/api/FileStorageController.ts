import { Request, Response } from 'express';
import { FileStorageService } from '../core/services/FileStorageService';
import { FileMetadata } from '../core/file-storage.types';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('FileStorageController');

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File storage and management endpoints
 */
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  /**
   * @swagger
   * /files/upload:
   *   post:
   *     summary: Upload a file
   *     tags: [Files]
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
   *               entityType:
   *                 type: string
   *               entityId:
   *                 type: string
   *               category:
   *                 type: string
   *               tags:
   *                 type: string
   *               customName:
   *                 type: string
   *     responses:
   *       200:
   *         description: File uploaded successfully
   *       400:
   *         description: No file uploaded
   *       500:
   *         description: Internal server error
   */
  uploadFile = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        logger.warn('File upload attempt without file');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { entityType, entityId, category, tags, customName } = req.body;
      logger.debug('File upload attempt', {
        entityType,
        entityId,
        category,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      });

      const metadata: FileMetadata = {
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: customName || req.file.originalname,
        mimeType: req.file.mimetype,
        category: category || 'document',
        tags: tags ? tags.split(',') : [],
        uploadedBy: req.user?.id || null
      };

      const fileId = await this.fileStorageService.uploadFile(
        req.file.buffer,
        metadata
      );

      logger.info('File uploaded successfully', { fileId, entityType, entityId });
      res.json({
        success: true,
        fileId,
        message: 'File uploaded successfully'
      });

    } catch (error) {
      logger.error('File upload failed', error, {
        entityType: req.body.entityType,
        entityId: req.body.entityId,
        originalName: req.file?.originalname
      });
      res.status(500).json({
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * @swagger
   * /files/{fileId}/download:
   *   get:
   *     summary: Download a file
   *     tags: [Files]
   *     parameters:
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
   *         description: File not found
   *       500:
   *         description: Internal server error
   */
  downloadFile = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;

      const metadata = await this.fileStorageService.getFileMetadata(fileId);
      if (!metadata) {
        return res.status(404).json({ error: 'File not found' });
      }

      const userId = req.user?.id;
      // Note: Legacy controller enforced auth here. We'll keep it optional in service but enforce in controller if needed.
      // If this is a public download link, we might need to relax this.
      // For now, we'll pass userId if available.
      
      const fileBuffer = await this.fileStorageService.downloadFile(fileId, userId);

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
      res.setHeader('Content-Length', metadata.fileSize);

      res.send(fileBuffer);

    } catch (error) {
      logger.error('File download error:', error);
      res.status(500).json({
        error: 'Failed to download file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * List files (paginated)
   */
  listFiles = async (req: Request, res: Response) => {
    try {
      const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || '20'), 10)));
      const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
      const offset = (page - 1) * limit;
      const entityType = req.query.entityType ? String(req.query.entityType) : null;
      const entityId = req.query.entityId ? String(req.query.entityId) : null;

      const { items, total } = await this.fileStorageService.listFiles({ limit, offset, entityType, entityId });

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.json({
        success: true,
        data: {
          files: items,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext,
            hasPrev
          }
        }
      });
    } catch (error) {
      logger.error('File listing error:', error);
      res.status(500).json({
        error: 'Failed to list files',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get metadata for a single file
   */
  getMetadata = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const metadata = await this.fileStorageService.getFileMetadata(fileId);
      if (!metadata) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      return res.json({ success: true, data: metadata });
    } catch (error) {
      logger.error('File metadata error:', error);
      res.status(500).json({
        error: 'Failed to retrieve file metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete a file and its content
   */
  deleteFile = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const deleted = await this.fileStorageService.deleteFile(fileId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'File not found' });
      }

      return res.json({ success: true, message: 'File deleted' });
    } catch (error) {
      logger.error('File delete error:', error);
      res.status(500).json({
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
