import { Router } from 'express';
import { ReceiptController } from './ReceiptController';
import { conditionalAuth } from '@/shared/middleware/authMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { IUserService } from '@/features/auth/user/core/IUserService';

export const createReceiptRoutes = (controller: ReceiptController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all receipt routes
  const auth = conditionalAuth(userService);

  // Receipt CRUD routes
  router.get('/', auth, asyncHandler(controller.getAllReceipts.bind(controller)));
  router.get('/:id', auth, asyncHandler(controller.getReceiptById.bind(controller)));
  router.get('/number/:receiptNumber', auth, asyncHandler(controller.getReceiptByNumber.bind(controller)));
  router.get('/property/:propertyId', auth, asyncHandler(controller.getReceiptsByProperty.bind(controller)));
  router.get('/tenant/:tenantId', auth, asyncHandler(controller.getReceiptsByTenant.bind(controller)));

  // Receipt generation routes
  router.post('/generate', auth, asyncHandler(controller.generateReceipt.bind(controller)));
  router.post('/generate-bulk', auth, asyncHandler(controller.generateBulkReceipts.bind(controller)));

  // Receipt management routes
  router.put('/:id', auth, asyncHandler(controller.updateReceipt.bind(controller)));
  router.delete('/:id', auth, asyncHandler(controller.deleteReceipt.bind(controller)));

  // Receipt actions
  router.post('/:id/send-email', auth, asyncHandler(controller.sendReceiptByEmail.bind(controller)));
  router.get('/:id/download', auth, asyncHandler(controller.downloadReceiptPDF.bind(controller)));

  // Property receipt settings routes
  router.get('/settings/property/:propertyId', auth, asyncHandler(controller.getPropertyReceiptSettings.bind(controller)));
  router.put('/settings/property/:propertyId', auth, asyncHandler(controller.updatePropertyReceiptSettings.bind(controller)));

  return router;
};