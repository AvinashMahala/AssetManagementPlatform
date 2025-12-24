import { Router } from 'express';
import { ReceiptTemplateController } from './ReceiptTemplateController';
import { conditionalAuth, AuthenticatedRequest } from '@/shared/middleware/authMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { IUserService } from '@/features/auth/user/core/IUserService';

export const createReceiptTemplateRoutes = (controller: ReceiptTemplateController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all template routes
  const auth = conditionalAuth(userService);

  // Template management routes
  router.get('/', auth, asyncHandler(controller.getAllTemplates.bind(controller)));
  router.get('/available', auth, asyncHandler(controller.getAvailableTemplates.bind(controller)));
  router.get('/default', auth, asyncHandler(controller.getDefaultTemplate.bind(controller)));
  router.get('/type/:type', auth, asyncHandler(controller.getTemplateByType.bind(controller)));
  router.get('/:id', auth, asyncHandler(controller.getTemplateById.bind(controller)));
  router.post('/', auth, asyncHandler(controller.createTemplate.bind(controller)));
  router.put('/:id', auth, asyncHandler(controller.updateTemplate.bind(controller)));
  router.put('/:id/default', auth, asyncHandler(controller.setDefaultTemplate.bind(controller)));
  router.delete('/:id', auth, asyncHandler(controller.deleteTemplate.bind(controller)));

  // Property template routes
  router.get('/properties/:propertyId/template', auth, asyncHandler(controller.getPropertyTemplateSettings.bind(controller)));
  router.put('/properties/:propertyId/template', auth, asyncHandler(controller.setPropertyTemplate.bind(controller)));

  return router;
};