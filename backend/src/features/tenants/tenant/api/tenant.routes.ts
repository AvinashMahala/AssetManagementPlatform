import { Router } from 'express';
import { TenantController } from './TenantController';
import { authMiddleware } from '@/shared/middleware/authMiddleware';
import { IUserService } from '@/features/auth/user/core/IUserService';

export const createTenantRoutes = (controller: TenantController, userService: IUserService): Router => {
  const router = Router();

  router.use(authMiddleware(userService));

  router.post('/', controller.create);
  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
};
