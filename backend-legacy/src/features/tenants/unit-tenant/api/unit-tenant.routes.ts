import { Router } from 'express';
import { UnitTenantController } from './UnitTenantController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';
import { asyncHandler } from '@/shared/middleware/errorHandler';

/**
 * Unit-Tenant routes
 *
 * These endpoints manage assignments between units and tenants. They are
 * accessible directly under the unit-tenant resource; nested unit routes
 * (e.g. /units/:id/tenants) are handled elsewhere by the UnitModule.
 */
export const createUnitTenantRoutes = (
  controller: UnitTenantController,
  userService: any
): Router => {
  const router = Router();
  const auth = conditionalAuth(userService);

  /** 001. List assignments
   * GET /
   * Query: optional unitId, tenantId
   * Auth: conditional
   * Success: 200 with assignments (optionally filtered)
   */
  router.get('/', auth, asyncHandler(controller.getAll.bind(controller)));

  /** 002. Get assignment by id
   * GET /:id
   * Params: id
   * Auth: conditional
   * Success: 200 with assignment or 404 if not found
   */
  router.get('/:id', auth, asyncHandler(controller.getById.bind(controller)));

  /** 003. Assign a tenant to a unit
   * POST /
   * Body: { unitId, tenantId, ... }
   * Auth: conditional
   * Success: 201 with created assignment
   */
  router.post('/', auth, asyncHandler(controller.assignTenant.bind(controller)));

  /** 004. Update an assignment
   * PUT /:unitId/:tenantId
   * Params: unitId, tenantId
   * Auth: conditional
   * Success: 200 with updated assignment or 404
   */
  router.put('/:unitId/:tenantId', auth, asyncHandler(controller.updateAssignment.bind(controller)));

  /** 005. Remove a tenant from a unit
   * DELETE /:unitId/:tenantId
   * Params: unitId, tenantId
   * Auth: conditional
   * Success: 200 with confirmation or 404
   */
  router.delete('/:unitId/:tenantId', auth, asyncHandler(controller.removeTenant.bind(controller)));

  return router;
};
