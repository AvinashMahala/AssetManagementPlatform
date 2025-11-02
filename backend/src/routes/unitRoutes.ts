import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { devAuthBypass } from '../middlewares/authMiddleware';

export const createUnitRoutes = (controller: UnitController) => {
  const router = Router();

  // Unit CRUD routes
  router.get('/units', devAuthBypass, controller.getAll.bind(controller));
  router.get('/units/:id', devAuthBypass, controller.getById.bind(controller));
  router.post('/units', devAuthBypass, controller.create.bind(controller));
  router.put('/units/:id', devAuthBypass, controller.update.bind(controller));
  router.delete('/units/:id', devAuthBypass, controller.delete.bind(controller));
  router.patch('/units/:id/status', devAuthBypass, controller.updateStatus.bind(controller));

  // Unit tenant management routes
  router.get('/units/:id/tenants', devAuthBypass, controller.getTenants.bind(controller));
  router.post('/units/:unitId/tenants', devAuthBypass, controller.assignTenant.bind(controller));
  router.put('/units/:unitId/tenants/:tenantId', devAuthBypass, controller.updateTenantAssignment.bind(controller));
  router.delete('/units/:unitId/tenants/:tenantId', devAuthBypass, controller.removeTenant.bind(controller));

  return router;
};