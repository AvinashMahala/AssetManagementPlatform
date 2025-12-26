import { Request, Response, NextFunction } from 'express';
import { ITenantDocumentService } from '../core/interfaces/ITenantDocumentService';
import { FileStorageService } from '@/features/files/file-storage/core/services/FileStorageService';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('TenantDocumentController');

export class TenantDocumentController {
  constructor(
    private readonly documentService: ITenantDocumentService,
    private readonly fileStorageService?: FileStorageService
  ) {}

  uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.params as { tenantId: string };

      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const { documentType, documentName, documentNumber, customName } = req.body;

      // Upload file to central FileStorage (if available)
      let fileId: string | undefined;
      if (this.fileStorageService) {
        const metadata = {
          entityType: 'tenant',
          entityId: tenantId,
          filename: `${Date.now()}-${req.file.originalname}`,
          originalName: customName || req.file.originalname,
          mimeType: req.file.mimetype,
          category: 'document',
          tags: [],
          uploadedBy: req.user?.id || null
        } as any;

        fileId = await this.fileStorageService.uploadFile(req.file.buffer, metadata);
      }

      const fileUrl = fileId ? `/api/v1/files/${fileId}/download` : undefined;
      const fileSize = req.file.size;

      const document = await this.documentService.addDocument(tenantId, {
        documentType,
        documentName,
        documentNumber,
        fileUrl: fileUrl || req.body.fileUrl,
        fileSize: fileSize || Number(req.body.fileSize || 0),
        verified: false,
      });

      res.status(201).json(document);
    } catch (error) {
      logger.error('uploadDocument failed', error);
      next(error);
    }
  };

  getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.params as { tenantId: string };
      const docs = await this.documentService.getDocuments(tenantId);
      res.json(docs);
    } catch (error) {
      logger.error('getDocuments failed', error);
      next(error);
    }
  };

  updateDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, documentId } = req.params as { tenantId?: string; documentId: string };
      const data = req.body;
      const updated = await this.documentService.updateDocument(documentId, data);
      if (!updated) return res.status(404).json({ error: 'Document not found' });
      res.json(updated);
    } catch (error) {
      logger.error('updateDocument failed', error);
      next(error);
    }
  };

  deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, documentId } = req.params as { tenantId?: string; documentId: string };
      const deleted = await this.documentService.deleteDocument(documentId);
      if (!deleted) return res.status(404).json({ error: 'Document not found' });
      res.status(204).send();
    } catch (error) {
      logger.error('deleteDocument failed', error);
      next(error);
    }
  };

  verifyDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId, documentId } = req.params as { tenantId?: string; documentId: string };
      const verifiedBy = req.user?.id || req.body.verifiedBy || 'system';
      const ok = await this.documentService.verifyDocument(documentId, verifiedBy);
      res.json({ success: ok });
    } catch (error) {
      logger.error('verifyDocument failed', error);
      next(error);
    }
  };
}

export default TenantDocumentController;
