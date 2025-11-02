import { Router } from 'express';
import { TenantController } from '../controllers/TenantController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export const createTenantRoutes = (controller: TenantController) => {
  const router = Router();

  // Tenant CRUD routes
  router.get('/tenants', authMiddleware, controller.getAllTenants.bind(controller));
  router.get('/tenants/:id', authMiddleware, controller.getTenantById.bind(controller));
  router.get('/tenants/email/:email', authMiddleware, controller.getTenantByEmail.bind(controller));
  router.get('/tenants/phone/:phone', authMiddleware, controller.getTenantByPhone.bind(controller));
  router.post('/tenants', authMiddleware, controller.createTenant.bind(controller));
  router.put('/tenants/:id', authMiddleware, controller.updateTenant.bind(controller));
  router.delete('/tenants/:id', authMiddleware, controller.deleteTenant.bind(controller));
  router.patch('/tenants/:id/status', authMiddleware, controller.updateTenantStatus.bind(controller));

  // Document management routes
  router.post('/tenants/:tenantId/documents', authMiddleware, controller.addTenantDocument.bind(controller));
  router.get('/tenants/:tenantId/documents', authMiddleware, controller.getTenantDocuments.bind(controller));
  router.put('/tenants/documents/:documentId', authMiddleware, controller.updateTenantDocument.bind(controller));
  router.delete('/tenants/documents/:documentId', authMiddleware, controller.deleteTenantDocument.bind(controller));
  router.patch('/tenants/documents/:documentId/verify', authMiddleware, controller.verifyTenantDocument.bind(controller));

  return router;
};