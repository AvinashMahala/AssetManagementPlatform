import { Router } from 'express';
import { UnitTenantController } from '../controllers/UnitTenantController';
import { conditionalAuth } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createUnitTenantRoutes = (controller: UnitTenantController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Unit-Tenant assignment CRUD routes
  router.get('/unit-tenants', auth, controller.getAll.bind(controller));
  router.get('/unit-tenants/:id', auth, controller.getById.bind(controller));
  router.post('/unit-tenants', auth, controller.assignTenant.bind(controller));
  router.put('/unit-tenants/:unitId/:tenantId', auth, controller.updateAssignment.bind(controller));
  router.delete('/unit-tenants/:unitId/:tenantId', auth, controller.removeTenant.bind(controller));

  return router;
};