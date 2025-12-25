import { Router, RequestHandler } from 'express';
import { IReceiptTemplateController } from '../types';
import { asyncHandler } from '@/shared/middleware/errorHandler';

/**
 * Creates a sub-router for property receipt template operations.
 * Mounted at '/:propertyId/receipt-template' by the parent router.
 */
export const createPropertyTemplatesRouter = (receiptController: IReceiptTemplateController, auth: RequestHandler) => {
  const router = Router({ mergeParams: true });

  /** 001. Create a new receipt template for a property.
   *       POST /:propertyId/receipt-template
   */
  router.post('/', auth, asyncHandler(receiptController.createTemplate.bind(receiptController)));

  /** 002. Get the receipt template for a property.
   *       GET /:propertyId/receipt-template
   */
  router.get('/', auth, asyncHandler(receiptController.getTemplate.bind(receiptController)));

  /** 003. Update the receipt template for a property.
   *       PUT /:propertyId/receipt-template
   */
  router.put('/', auth, asyncHandler(receiptController.updateTemplate.bind(receiptController)));

  /** 004. Delete the receipt template for a property.
   *       DELETE /:propertyId/receipt-template
   */
  router.delete('/', auth, asyncHandler(receiptController.deleteTemplate.bind(receiptController)));

  /** 005. Generate UPI links for a property's receipt template.
   *       GET /:propertyId/upi-links
   */
  router.get('/upi-links', auth, asyncHandler(receiptController.generateUPILinks.bind(receiptController)));

  return router;
};
