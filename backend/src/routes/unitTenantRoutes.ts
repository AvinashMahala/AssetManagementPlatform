import { Router } from 'express';
import { UnitTenantController } from '../controllers/UnitTenantController';
import { devAuthBypass } from '../middlewares/authMiddleware';

export const createUnitTenantRoutes = (controller: UnitTenantController) => {
  const router = Router();

  // Unit-Tenant assignment CRUD routes
  router.get('/unit-tenants', devAuthBypass, controller.getAll.bind(controller));
  router.get('/unit-tenants/:id', devAuthBypass, controller.getById.bind(controller));
  router.post('/unit-tenants', devAuthBypass, controller.assignTenant.bind(controller));
  router.put('/unit-tenants/:unitId/:tenantId', devAuthBypass, controller.updateAssignment.bind(controller));
  router.delete('/unit-tenants/:unitId/:tenantId', devAuthBypass, controller.removeTenant.bind(controller));

  return router;
};