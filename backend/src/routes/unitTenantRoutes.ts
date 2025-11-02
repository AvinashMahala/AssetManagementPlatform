import { Router } from 'express';
import { UnitTenantController } from '../controllers/UnitTenantController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createUnitTenantRoutes = (controller: UnitTenantController) => {
  const router = Router();

  // Unit-Tenant assignment CRUD routes
  router.get('/unit-tenants', authMiddleware, controller.getAll.bind(controller));
  router.get('/unit-tenants/:id', authMiddleware, controller.getById.bind(controller));
  router.post('/unit-tenants', authMiddleware, controller.assignTenant.bind(controller));
  router.put('/unit-tenants/:unitId/:tenantId', authMiddleware, controller.updateAssignment.bind(controller));
  router.delete('/unit-tenants/:unitId/:tenantId', authMiddleware, controller.removeTenant.bind(controller));

  return router;
};