import { Router } from 'express';
import { UnitController } from './UnitController.js';
import { UnitTenantController } from '@/features/tenants/unit-tenant/api/UnitTenantController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';

export const createUnitRoutes = (
  controller: UnitController,
  unitTenantController: UnitTenantController,
  userService: any
) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Unit CRUD
  router.get('/', auth, controller.getAll.bind(controller));
  router.get('/:id', auth, controller.getById.bind(controller));
  router.post('/', auth, controller.create.bind(controller));
  router.put('/:id', auth, controller.update.bind(controller));
  router.delete('/:id', auth, controller.delete.bind(controller));
  router.patch('/:id/status', auth, controller.updateStatus.bind(controller));
  router.get('/:id/analytics', auth, controller.getAnalytics.bind(controller));

  // Unit Tenant Routes
  router.get('/:id/tenants', auth, unitTenantController.getTenants.bind(unitTenantController));
  router.post('/:unitId/tenants', auth, unitTenantController.assignTenant.bind(unitTenantController));
  router.put('/:unitId/tenants/:tenantId', auth, unitTenantController.updateAssignment.bind(unitTenantController));
  router.delete('/:unitId/tenants/:tenantId', auth, unitTenantController.removeTenant.bind(unitTenantController));

  return router;
};
