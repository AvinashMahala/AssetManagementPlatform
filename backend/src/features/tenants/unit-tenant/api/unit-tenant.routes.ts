import { Router } from 'express';
import { UnitTenantController } from './UnitTenantController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';
import { asyncHandler } from '@/shared/middleware/errorHandler';

export const createUnitTenantRoutes = (
  controller: UnitTenantController,
  userService: any
) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Note: These routes are for direct access to unit-tenants resource
  // The nested routes under /units/:id/tenants are handled by UnitModule

  router.get('/', auth, asyncHandler(controller.getAll.bind(controller)));
  router.get('/:id', auth, asyncHandler(controller.getById.bind(controller)));
  router.post('/', auth, asyncHandler(controller.assignTenant.bind(controller)));
  router.put('/:unitId/:tenantId', auth, asyncHandler(controller.updateAssignment.bind(controller)));
  router.delete('/:unitId/:tenantId', auth, asyncHandler(controller.removeTenant.bind(controller)));

  return router;
};
