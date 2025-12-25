import { Router } from 'express';
import { UnitController } from './UnitController.js';
import { UnitTenantController } from '@/features/tenants/unit-tenant/api/UnitTenantController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';
import { asyncHandler } from '@/shared/middleware/errorHandler';

export const createUnitRoutes = (
  controller: UnitController,
  unitTenantController: UnitTenantController,
  userService: any
) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Unit CRUD
  router.get('/', auth, asyncHandler(controller.getAll.bind(controller)));
  router.get('/:id', auth, asyncHandler(controller.getById.bind(controller)));
  router.post('/', auth, asyncHandler(controller.create.bind(controller)));
  router.put('/:id', auth, asyncHandler(controller.update.bind(controller)));
  router.delete('/:id', auth, asyncHandler(controller.delete.bind(controller)));
  router.patch('/:id/status', auth, asyncHandler(controller.updateStatus.bind(controller)));
  router.get('/:id/analytics', auth, asyncHandler(controller.getAnalytics.bind(controller)));

  // Unit Tenant Routes
  router.get('/:id/tenants', auth, asyncHandler(unitTenantController.getTenants.bind(unitTenantController)));
  router.post('/:unitId/tenants', auth, asyncHandler(unitTenantController.assignTenant.bind(unitTenantController)));
  router.put('/:unitId/tenants/:tenantId', auth, asyncHandler(unitTenantController.updateAssignment.bind(unitTenantController)));
  router.delete('/:unitId/tenants/:tenantId', auth, asyncHandler(unitTenantController.removeTenant.bind(unitTenantController)));

  return router;
};
