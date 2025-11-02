import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const createUnitRoutes = (controller: UnitController) => {
  const router = Router();

  // Unit CRUD routes
  router.get('/units', authMiddleware, controller.getAll.bind(controller));
  router.get('/units/:id', authMiddleware, controller.getById.bind(controller));
  router.post('/units', authMiddleware, controller.create.bind(controller));
  router.put('/units/:id', authMiddleware, controller.update.bind(controller));
  router.delete('/units/:id', authMiddleware, controller.delete.bind(controller));
  router.patch('/units/:id/status', authMiddleware, controller.updateStatus.bind(controller));

  // Unit tenant management routes
  router.get('/units/:id/tenants', authMiddleware, controller.getTenants.bind(controller));
  router.post('/units/:unitId/tenants', authMiddleware, controller.assignTenant.bind(controller));
  router.put('/units/:unitId/tenants/:tenantId', authMiddleware, controller.updateTenantAssignment.bind(controller));
  router.delete('/units/:unitId/tenants/:tenantId', authMiddleware, controller.removeTenant.bind(controller));

  return router;
};