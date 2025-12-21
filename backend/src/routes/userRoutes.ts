import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { conditionalAuth } from '@/shared/middleware/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createUserRoutes = (controller: UserController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all user routes
  const auth = conditionalAuth(userService);

  router.get('/', auth, controller.getAllUsers.bind(controller));
  router.get('/:id', auth, controller.getUserById.bind(controller));
  router.post('/', controller.createUser.bind(controller));
  router.put('/:id', auth, controller.updateUser.bind(controller));
  router.delete('/:id', auth, controller.deleteUser.bind(controller));

  return router;
};