import { Router } from 'express';
import { TenantDocumentController } from './TenantDocumentController';
import { authMiddleware } from '@/shared/middleware/authMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { defaultMemoryUploader } from '@/shared/utils/uploads';
import { IUserService } from '@/features/auth/user/core/IUserService';

/**
 * Tenant Documents routes
 *
 * Creates an Express Router that handles document operations for tenants.
 * All routes require authentication via `authMiddleware`.
 */
export const createTenantDocumentRoutes = (
  controller: TenantDocumentController,
  userService: IUserService
): Router => {
  const router = Router();
  const auth = authMiddleware(userService);
  const upload = defaultMemoryUploader;

  /** 001. Upload a document for a tenant
   * POST /:tenantId
   * Params: tenantId
   * Body: multipart file under `file` plus optional metadata in body
   * Auth: required
   * Success: 201 with created document
   */
  router.post('/:tenantId', auth, upload.single('file') as any, asyncHandler(controller.uploadDocument.bind(controller)));

  /** 002. List documents for a tenant
   * GET /:tenantId
   * Params: tenantId
   * Auth: required
   * Success: 200 with array of documents
   */
  router.get('/:tenantId', auth, asyncHandler(controller.getDocuments.bind(controller)));

  /** 003. Update a document
   * PUT /:tenantId/:documentId
   * Params: tenantId, documentId
   * Body: partial fields to update
   * Auth: required
   * Success: 200 with updated document or 404 if not found
   */
  router.put('/:tenantId/:documentId', auth, asyncHandler(controller.updateDocument.bind(controller)));

  /** 004. Delete a document
   * DELETE /:tenantId/:documentId
   * Params: tenantId, documentId
   * Auth: required
   * Success: 204 on success or 404 if not found
   */
  router.delete('/:tenantId/:documentId', auth, asyncHandler(controller.deleteDocument.bind(controller)));

  /** 005. Verify a document
   * POST /:tenantId/:documentId/verify
   * Params: tenantId, documentId
   * Body: optional verifiedBy
   * Auth: required
   * Success: 200 with { success: true }
   */
  router.post('/:tenantId/:documentId/verify', auth, asyncHandler(controller.verifyDocument.bind(controller)));

  return router;
};

export default createTenantDocumentRoutes;
