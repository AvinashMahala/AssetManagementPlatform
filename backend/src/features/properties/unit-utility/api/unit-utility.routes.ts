import { Router } from 'express';
import { UnitUtilityController } from './UnitUtilityController';
import { conditionalAuth } from '@/shared/middleware/authMiddleware';
import { asyncHandler } from '@/shared/middleware/errorHandler';
import { IUserService } from '@/features/auth/user/core/IUserService';

export const createUnitUtilityRoutes = (controller: UnitUtilityController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Unit utility CRUD routes
  router.get('/unit-utilities', auth, asyncHandler(controller.getAll.bind(controller)));
  router.get('/unit-utilities/:id', auth, asyncHandler(controller.getById.bind(controller)));
  router.post('/unit-utilities', auth, asyncHandler(controller.create.bind(controller)));
  router.put('/unit-utilities/:id', auth, asyncHandler(controller.update.bind(controller)));
  router.delete('/unit-utilities/:id', auth, asyncHandler(controller.delete.bind(controller)));
  router.patch('/unit-utilities/:id/toggle', auth, asyncHandler(controller.toggleStatus.bind(controller)));

  // Unit utility business logic routes
  router.get('/unit-utilities/unit/:unitId/charges', auth, asyncHandler(controller.calculateCharges.bind(controller)));
  router.get('/unit-utilities/unit/:unitId/summary', auth, asyncHandler(controller.getSummary.bind(controller)));
  router.get('/unit-utilities/unit/:unitId/validate', auth, asyncHandler(controller.validateConfiguration.bind(controller)));

  return router;
};