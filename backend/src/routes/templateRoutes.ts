import { Router } from 'express';
import { Pool } from 'pg';
import { TemplateController } from '../controllers/TemplateController';
import { authMiddleware } from '../middlewares/authMiddleware';

export default (pool: Pool) => {
  const router = Router();
  const controller = new TemplateController(pool);

  router.get('/templates', authMiddleware, controller.getAllTemplates);
  router.get('/templates/:id', authMiddleware, controller.getTemplateById);
  router.post('/templates/:id/preview', authMiddleware, controller.generatePreview);
  router.get('/templates/:id/export', authMiddleware, controller.exportTemplate);
  router.post('/templates/import', authMiddleware, controller.importTemplate);
  router.post('/templates/:id/duplicate', authMiddleware, controller.duplicateTemplate);
  router.get('/templates/placeholders/available', authMiddleware, controller.getAvailablePlaceholders);
  router.get('/properties/:propertyId/template', authMiddleware, controller.getPropertyTemplateSettings);
  router.put('/properties/:propertyId/template', authMiddleware, controller.updatePropertyTemplateSettings);

  return router;
};
