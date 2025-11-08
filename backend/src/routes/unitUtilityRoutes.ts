import { Router } from 'express';
import { UnitUtilityController } from '../controllers/UnitUtilityController';
import { conditionalAuth } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createUnitUtilityRoutes = (controller: UnitUtilityController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Unit utility CRUD routes
  router.get('/unit-utilities', auth, controller.getAll.bind(controller));
  router.get('/unit-utilities/:id', auth, controller.getById.bind(controller));
  router.post('/unit-utilities', auth, controller.create.bind(controller));
  router.put('/unit-utilities/:id', auth, controller.update.bind(controller));
  router.delete('/unit-utilities/:id', auth, controller.delete.bind(controller));
  router.patch('/unit-utilities/:id/toggle', auth, controller.toggleStatus.bind(controller));

  // Unit utility business logic routes
  router.get('/unit-utilities/unit/:unitId/charges', auth, controller.calculateCharges.bind(controller));
  router.get('/unit-utilities/unit/:unitId/summary', auth, controller.getSummary.bind(controller));
  router.get('/unit-utilities/unit/:unitId/validate', auth, controller.validateConfiguration.bind(controller));

  return router;
};