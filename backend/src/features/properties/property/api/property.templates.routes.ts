import { Router, RequestHandler } from 'express';
import { IReceiptTemplateController } from '../types';
import { asyncHandler } from '@/shared/middleware/errorHandler';

/**
 * Creates a sub-router for property receipt template operations.
 * Mounted at '/:propertyId/receipt-template' by the parent router.
 */
export const createPropertyTemplatesRouter = (receiptController: IReceiptTemplateController, auth: RequestHandler) => {
  const router = Router({ mergeParams: true });

  // POST /:propertyId/receipt-template
  router.post('/', auth, asyncHandler(receiptController.createTemplate.bind(receiptController)));

  // GET /:propertyId/receipt-template
  router.get('/', auth, asyncHandler(receiptController.getTemplate.bind(receiptController)));

  // PUT /:propertyId/receipt-template
  router.put('/', auth, asyncHandler(receiptController.updateTemplate.bind(receiptController)));

  // DELETE /:propertyId/receipt-template
  router.delete('/', auth, asyncHandler(receiptController.deleteTemplate.bind(receiptController)));

  // GET /:propertyId/upi-links
  router.get('/upi-links', auth, asyncHandler(receiptController.generateUPILinks.bind(receiptController)));

  return router;
};
