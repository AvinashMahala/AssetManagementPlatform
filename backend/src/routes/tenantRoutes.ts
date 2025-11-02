import { Router } from 'express';
import { TenantController } from '../controllers/TenantController.js';
import { devAuthBypass } from '../middlewares/authMiddleware.js';

export const createTenantRoutes = (controller: TenantController) => {
  const router = Router();

  // Tenant CRUD routes
  router.get('/tenants', devAuthBypass, controller.getAllTenants.bind(controller));
  router.get('/tenants/:id', devAuthBypass, controller.getTenantById.bind(controller));
  router.get('/tenants/email/:email', devAuthBypass, controller.getTenantByEmail.bind(controller));
  router.get('/tenants/phone/:phone', devAuthBypass, controller.getTenantByPhone.bind(controller));
  router.post('/tenants', devAuthBypass, controller.createTenant.bind(controller));
  router.put('/tenants/:id', devAuthBypass, controller.updateTenant.bind(controller));
  router.delete('/tenants/:id', devAuthBypass, controller.deleteTenant.bind(controller));
  router.patch('/tenants/:id/status', devAuthBypass, controller.updateTenantStatus.bind(controller));

  // Document management routes
  router.post('/tenants/:tenantId/documents', devAuthBypass, controller.addTenantDocument.bind(controller));
  router.get('/tenants/:tenantId/documents', devAuthBypass, controller.getTenantDocuments.bind(controller));
  router.put('/tenants/documents/:documentId', devAuthBypass, controller.updateTenantDocument.bind(controller));
  router.delete('/tenants/documents/:documentId', devAuthBypass, controller.deleteTenantDocument.bind(controller));
  router.patch('/tenants/documents/:documentId/verify', devAuthBypass, controller.verifyTenantDocument.bind(controller));

  return router;
};