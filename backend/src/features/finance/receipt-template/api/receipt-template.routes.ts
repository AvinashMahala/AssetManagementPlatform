import { Router } from 'express';
import { ReceiptTemplateController } from './ReceiptTemplateController';
import { conditionalAuth, AuthenticatedRequest } from '@/shared/middleware/authMiddleware';
import { IUserService } from '@/features/auth/user/core/IUserService';

export const createReceiptTemplateRoutes = (controller: ReceiptTemplateController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all template routes
  const auth = conditionalAuth(userService);

  // Template management routes
  router.get('/', auth, controller.getAllTemplates.bind(controller));
  router.get('/available', auth, controller.getAvailableTemplates.bind(controller));
  router.get('/default', auth, controller.getDefaultTemplate.bind(controller));
  router.get('/type/:type', auth, controller.getTemplateByType.bind(controller));
  router.get('/:id', auth, controller.getTemplateById.bind(controller));
  router.post('/', auth, controller.createTemplate.bind(controller));
  router.put('/:id', auth, controller.updateTemplate.bind(controller));
  router.put('/:id/default', auth, controller.setDefaultTemplate.bind(controller));
  router.delete('/:id', auth, controller.deleteTemplate.bind(controller));

  // Property template routes
  router.get('/properties/:propertyId/template', auth, controller.getPropertyTemplateSettings.bind(controller));
  router.put('/properties/:propertyId/template', auth, controller.setPropertyTemplate.bind(controller));

  return router;
};