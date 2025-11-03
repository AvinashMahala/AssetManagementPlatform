import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController';
import { conditionalAuth, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createPropertyRoutes = (controller: PropertyController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all property routes
  const auth = conditionalAuth(userService);

  router.get('/', auth, controller.getAll.bind(controller));
  router.get('/:id', auth, controller.getById.bind(controller));
  router.post('/', auth, controller.create.bind(controller));
  router.put('/:id', auth, controller.update.bind(controller));
  router.delete('/:id', auth, controller.delete.bind(controller));
  router.patch('/:id/status', auth, controller.updateStatus.bind(controller));

  return router;
};