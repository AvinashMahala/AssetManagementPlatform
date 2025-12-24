import { Router, RequestHandler } from 'express';
import { LeaseController } from './LeaseController';
import { asyncHandler } from '@/shared/middleware/errorHandler';

export const createLeaseRoutes = (authMiddleware: RequestHandler) => {
  const router = Router();
  const controller = new LeaseController();

  router.use(authMiddleware);

  router.post('/', asyncHandler(controller.create.bind(controller)));
  router.get('/', asyncHandler(controller.list.bind(controller)));
  router.get('/:id', asyncHandler(controller.get.bind(controller)));
  router.put('/:id', asyncHandler(controller.update.bind(controller)));
  router.post('/:id/terminate', asyncHandler(controller.terminate.bind(controller)));

  return router;
};
