import { Request, Response, NextFunction } from 'express';
import { ITenantDocumentService } from '../core/interfaces/ITenantDocumentService';
import { FileStorageService } from '@/features/files/file-storage/core/services/FileStorageService';
import { createModuleLogger } from '@/shared/utils/logger';

const logger = createModuleLogger('TenantDocumentController');

/**
 * TenantDocumentController
 *
 * Handles HTTP requests related to tenant documents and delegates to the
 * document service and optional file storage service. Each method validates
 * input where applicable and returns appropriate HTTP responses or forwards
 * errors to the next middleware.
 */
export class TenantDocumentController {
  constructor(
    private readonly documentService: ITenantDocumentService,
    private readonly fileStorageService?: FileStorageService
  ) {}

  /**
   * Upload a document for a tenant
   *
   * Route: POST /:tenantId
   * - Expects a multipart file under the `file` field (handled by uploader middleware)
   * - Body may include: documentType, documentName, documentNumber, customName or fileUrl
   * - Auth: required (handled by route middleware)
   * - Success: 201 with created document
   * - Errors: 400 for missing file or required fields, or forwarded errors from services
   */
  uploadDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.params as { tenantId: string };

      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const { documentType, documentName, documentNumber, customName } = req.body;

      // Basic validation: require name or type to be meaningful
      if (!documentName && !documentType) {
        return res.status(400).json({ error: 'documentType or documentName is required' });
      }

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
          uploadedBy: (req.user as any)?.id || null,
        } as any;

        fileId = await this.fileStorageService.uploadFile(req.file.buffer, metadata);
      }

      const fileUrl = fileId ? `/api/v1/files/${fileId}/download` : undefined;
      const fileSize = req.file?.size ?? (req.file?.buffer ? req.file.buffer.length : Number(req.body.fileSize || 0));

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
      logger.error('uploadDocument failed', { error });
      next(error);
    }
  };

  /**
   * List documents for a tenant
   *
   * Route: GET /:tenantId
   * - Returns an array of document records
   */
  getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tenantId } = req.params as { tenantId: string };
      const docs = await this.documentService.getDocuments(tenantId);
      res.json(docs);
    } catch (error) {
      logger.error('getDocuments failed', { error });
      next(error);
    }
  };

  /**
   * Update a document
   *
   * Route: PUT /:tenantId/:documentId
   * - Body: partial fields to update
   * - Success: 200 with updated document, 404 if not found
   */
  updateDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params as { documentId: string };
      const data = req.body;
      const updated = await this.documentService.updateDocument(documentId, data);
      if (!updated) return res.status(404).json({ error: 'Document not found' });
      res.json(updated);
    } catch (error) {
      logger.error('updateDocument failed', { error });
      next(error);
    }
  };

  /**
   * Delete a document
   *
   * Route: DELETE /:tenantId/:documentId
   * - Success: 204 on successful deletion, 404 if not found
   */
  deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params as { documentId: string };
      const deleted = await this.documentService.deleteDocument(documentId);
      if (!deleted) return res.status(404).json({ error: 'Document not found' });
      res.status(204).send();
    } catch (error) {
      logger.error('deleteDocument failed', { error });
      next(error);
    }
  };

  /**
   * Verify a document (mark as verified)
   *
   * Route: POST /:tenantId/:documentId/verify
   * - Body may include verifiedBy, otherwise `req.user.id` or 'system' is used
   */
  verifyDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { documentId } = req.params as { documentId: string };
      const verifiedBy = (req.user as any)?.id || req.body.verifiedBy || 'system';
      const ok = await this.documentService.verifyDocument(documentId, verifiedBy);
      res.json({ success: ok });
    } catch (error) {
      logger.error('verifyDocument failed', { error });
      next(error);
    }
  };
}

export default TenantDocumentController;
