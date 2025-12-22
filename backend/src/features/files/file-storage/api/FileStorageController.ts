import { Request, Response } from 'express';
import { FileStorageService } from '../core/services/FileStorageService';
import { FileMetadata } from '../core/file-storage.types';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('FileStorageController');

export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

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
}
