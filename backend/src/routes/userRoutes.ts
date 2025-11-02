import { Router } from 'express';
import { UserController } from '../controllers/userController';

export const createUserRoutes = (controller: UserController) => {
  const router = Router();

  router.get('/', controller.getAllUsers.bind(controller));
  router.get('/:id', controller.getUserById.bind(controller));
  router.post('/', controller.createUser.bind(controller));
  router.put('/:id', controller.updateUser.bind(controller));
  router.delete('/:id', controller.deleteUser.bind(controller));

  return router;
};