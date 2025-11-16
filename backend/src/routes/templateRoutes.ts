import { Router } from 'express';
import { Pool } from 'pg';
import { TemplateController } from '../controllers/TemplateController';
import { conditionalAuth } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export default (pool: Pool, userService: IUserService) => {
  const router = Router();
  const controller = new TemplateController(pool);
  const auth = conditionalAuth(userService);

  router.get('/templates', controller.getAllTemplates);
  router.get('/templates/:id', auth, controller.getTemplateById);
  router.post('/templates/:id/preview', auth, controller.generatePreview);
  router.get('/templates/:id/export', auth, controller.exportTemplate);
  router.post('/templates/import', auth, controller.importTemplate);
  router.post('/templates/:id/duplicate', auth, controller.duplicateTemplate);
  router.get('/templates/placeholders/available', auth, controller.getAvailablePlaceholders);
  router.get('/properties/:propertyId/template', auth, controller.getPropertyTemplateSettings);
  router.put('/properties/:propertyId/template', auth, controller.updatePropertyTemplateSettings);

  return router;
};
