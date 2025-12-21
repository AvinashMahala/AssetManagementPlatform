import { Router } from 'express';
import { UnitController } from './UnitController.js';
import { conditionalAuth } from '@/shared/middleware/authMiddleware.js';

export const createUnitRoutes = (
  controller: UnitController,
  userService: any
) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  router.get('/', auth, controller.getAll.bind(controller));
  router.get('/:id', auth, controller.getById.bind(controller));
  router.post('/', auth, controller.create.bind(controller));
  router.put('/:id', auth, controller.update.bind(controller));
  router.delete('/:id', auth, controller.delete.bind(controller));
  router.patch('/:id/status', auth, controller.updateStatus.bind(controller));

  return router;
};
