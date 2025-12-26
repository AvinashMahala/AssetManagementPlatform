import { Router } from 'express';
import { TenantDocumentController } from './TenantDocumentController';
import { authMiddleware } from '@/shared/middleware/authMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { defaultMemoryUploader } from '@/shared/utils/uploads';
import { IUserService } from '@/features/auth/user/core/IUserService';

export const createTenantDocumentRoutes = (controller: TenantDocumentController, userService: IUserService) => {
  const router = Router();
  const auth = authMiddleware(userService);
  const upload = defaultMemoryUploader;

  // Upload a document for a tenant
  router.post('/:tenantId', auth, upload.single('file') as any, asyncHandler(controller.uploadDocument.bind(controller)));

  // List documents for a tenant
  router.get('/:tenantId', auth, asyncHandler(controller.getDocuments.bind(controller)));

  // Update a document
  router.put('/:tenantId/:documentId', auth, asyncHandler(controller.updateDocument.bind(controller)));

  // Delete a document
  router.delete('/:tenantId/:documentId', auth, asyncHandler(controller.deleteDocument.bind(controller)));

  // Verify a document
  router.post('/:tenantId/:documentId/verify', auth, asyncHandler(controller.verifyDocument.bind(controller)));

  return router;
};

export default createTenantDocumentRoutes;
