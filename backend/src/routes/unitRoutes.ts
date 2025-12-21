import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { conditionalAuth } from '@/shared/middleware/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createUnitRoutes = (controller: UnitController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Unit CRUD routes
  router.get('/units', auth, controller.getAll.bind(controller));
  router.get('/units/:id', auth, controller.getById.bind(controller));
  router.post('/units', auth, controller.create.bind(controller));
  router.put('/units/:id', auth, controller.update.bind(controller));
  router.delete('/units/:id', auth, controller.delete.bind(controller));
  router.patch('/units/:id/status', auth, controller.updateStatus.bind(controller));

  // Unit tenant management routes
  router.get('/units/:id/tenants', auth, controller.getTenants.bind(controller));
  router.post('/units/:unitId/tenants', auth, controller.assignTenant.bind(controller));
  router.put('/units/:unitId/tenants/:tenantId', auth, controller.updateTenantAssignment.bind(controller));
  router.delete('/units/:unitId/tenants/:tenantId', auth, controller.removeTenant.bind(controller));

  // Unit analytics routes
  router.get('/units/:id/analytics', auth, controller.getAnalytics.bind(controller));

  return router;
};