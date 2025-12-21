import { Router } from 'express';
import { TenantController } from '../controllers/TenantController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';
import { IUserService } from '../interfaces/services/IUserService.js';

export const createTenantRoutes = (controller: TenantController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Tenant CRUD routes
  router.get('/tenants', auth, controller.getAllTenants.bind(controller));
  router.get('/tenants/:id', auth, controller.getTenantById.bind(controller));
  router.get('/tenants/email/:email', auth, controller.getTenantByEmail.bind(controller));
  router.get('/tenants/phone/:phone', auth, controller.getTenantByPhone.bind(controller));
  router.post('/tenants', auth, controller.createTenant.bind(controller));
  router.put('/tenants/:id', auth, controller.updateTenant.bind(controller));
  router.delete('/tenants/:id', auth, controller.deleteTenant.bind(controller));
  router.patch('/tenants/:id/status', auth, controller.updateTenantStatus.bind(controller));

  // Document management routes
  router.post('/tenants/:tenantId/documents', auth, controller.addTenantDocument.bind(controller));
  router.get('/tenants/:tenantId/documents', auth, controller.getTenantDocuments.bind(controller));
  router.put('/tenants/documents/:documentId', auth, controller.updateTenantDocument.bind(controller));
  router.delete('/tenants/documents/:documentId', auth, controller.deleteTenantDocument.bind(controller));
  router.patch('/tenants/documents/:documentId/verify', auth, controller.verifyTenantDocument.bind(controller));

  return router;
};