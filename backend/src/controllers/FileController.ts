import { Request, Response } from 'express';
import { FileStorageService, FileMetadata } from '../services/FileStorageService.js';

export class FileController {
  constructor(private fileStorageService: FileStorageService) {}

  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { entityType, entityId, category, tags } = req.body;

      if (!entityType || !entityId) {
        return res.status(400).json({
          error: 'entityType and entityId are required'
        });
      }

      const metadata: FileMetadata = {
        entityType,
        entityId,
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        category: category || 'document',
        tags: tags ? tags.split(',') : [],
        uploadedBy: req.user?.id || null // TODO: Get from auth middleware
      };

      const fileId = await this.fileStorageService.uploadFile(
        req.file.buffer,
        metadata
      );

      res.json({
        success: true,
        fileId,
        message: 'File uploaded successfully'
      });

    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async downloadFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const metadata = await this.fileStorageService.getFileMetadata(fileId);
      if (!metadata) {
        return res.status(404).json({ error: 'File not found' });
      }

      const fileBuffer = await this.fileStorageService.downloadFile(fileId);

      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${metadata.originalName}"`);
      res.setHeader('Content-Length', metadata.fileSize);

      res.send(fileBuffer);

    } catch (error) {
      console.error('File download error:', error);
      res.status(500).json({
        error: 'Failed to download file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFileMetadata(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const metadata = await this.fileStorageService.getFileMetadata(fileId);
      if (!metadata) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json(metadata);

    } catch (error) {
      console.error('Get file metadata error:', error);
      res.status(500).json({
        error: 'Failed to get file metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async listEntityFiles(req: Request, res: Response) {
    try {
      const { entityType, entityId } = req.params;

      const files = await this.fileStorageService.listEntityFiles(entityType, entityId);

      res.json({
        files,
        count: files.length
      });

    } catch (error) {
      console.error('List entity files error:', error);
      res.status(500).json({
        error: 'Failed to list files',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async deleteFile(req: Request, res: Response) {
    try {
      const { fileId } = req.params;

      const deleted = await this.fileStorageService.deleteFile(fileId);
      if (!deleted) {
        return res.status(404).json({ error: 'File not found or already deleted' });
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      console.error('File delete error:', error);
      res.status(500).json({
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getStorageStats(req: Request, res: Response) {
    try {
      const stats = await this.fileStorageService.getStorageStats();

      res.json(stats);

    } catch (error) {
      console.error('Get storage stats error:', error);
      res.status(500).json({
        error: 'Failed to get storage statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async listAllFiles(req: Request, res: Response) {
    try {
      const {
        entityType,
        category,
        search,
        limit = '50',
        offset = '0'
      } = req.query;

      const filters = {
        entityType: entityType as string | undefined,
        category: category as string | undefined,
        search: search as string | undefined,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      };

      const result = await this.fileStorageService.listAllFiles(filters);

      const totalPages = Math.ceil(result.total / filters.limit);
      const currentPage = Math.floor(filters.offset / filters.limit) + 1;

      res.json({
        files: result.files,
        pagination: {
          total: result.total,
          page: currentPage,
          limit: filters.limit,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1
        },
        filters
      });

    } catch (error) {
      console.error('List all files error:', error);
      res.status(500).json({
        error: 'Failed to list files',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}