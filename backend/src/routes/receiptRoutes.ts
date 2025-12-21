import { Router } from 'express';
import { ReceiptController } from '../controllers/ReceiptController';
import { conditionalAuth } from '@/shared/middleware/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createReceiptRoutes = (controller: ReceiptController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all receipt routes
  const auth = conditionalAuth(userService);

  // Receipt CRUD routes
  router.get('/', auth, controller.getAllReceipts.bind(controller));
  router.get('/:id', auth, controller.getReceiptById.bind(controller));
  router.get('/number/:receiptNumber', auth, controller.getReceiptByNumber.bind(controller));
  router.get('/property/:propertyId', auth, controller.getReceiptsByProperty.bind(controller));
  router.get('/tenant/:tenantId', auth, controller.getReceiptsByTenant.bind(controller));

  // Receipt generation routes
  router.post('/generate', auth, controller.generateReceipt.bind(controller));
  router.post('/generate-bulk', auth, controller.generateBulkReceipts.bind(controller));

  // Receipt management routes
  router.put('/:id', auth, controller.updateReceipt.bind(controller));
  router.delete('/:id', auth, controller.deleteReceipt.bind(controller));

  // Receipt actions
  router.post('/:id/send-email', auth, controller.sendReceiptByEmail.bind(controller));
  router.get('/:id/download', auth, controller.downloadReceiptPDF.bind(controller));

  // Property receipt settings routes
  router.get('/settings/property/:propertyId', auth, controller.getPropertyReceiptSettings.bind(controller));
  router.put('/settings/property/:propertyId', auth, controller.updatePropertyReceiptSettings.bind(controller));

  return router;
};