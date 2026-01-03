import { Router } from 'express';
import { TenantController } from './TenantController';
import { authMiddleware } from '@/shared/middleware/authMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { IUserService } from '@/features/auth/user/core/IUserService';

export const createTenantRoutes = (controller: TenantController, userService: IUserService): Router => {
  const router = Router();

  // Require authentication for all tenant routes
  router.use(authMiddleware(userService));

  /** 001. Create a new Tenant
   * POST /
   * Body: tenant payload (see TenantController.create)
   * Auth: required
   * Success: 201 (created) with tenant
   */
  router.post('/', asyncHandler(controller.create.bind(controller)));

  /** 002. List tenants
   * GET /
   * Query params: optional filters/pagination
   * Auth: required
   * Success: 200 with list of tenants
   */
  router.get('/', asyncHandler(controller.list.bind(controller)));

  /** 003. Get tenant by ID
   * GET /:id
   * Params: id (tenant id)
   * Auth: required
   * Success: 200 with tenant object or 404 if not found
   */
  router.get('/:id', asyncHandler(controller.getById.bind(controller)));

  /** 004. Update tenant
   * PUT /:id
   * Params: id (tenant id)
   * Body: fields to update
   * Auth: required
   * Success: 200 with updated tenant
   */
  router.put('/:id', asyncHandler(controller.update.bind(controller)));

  /** 005. Delete tenant
   * DELETE /:id
   * Params: id (tenant id)
   * Auth: required
   * Success: 204 on successful deletion
   */
  router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

  return router;
};
