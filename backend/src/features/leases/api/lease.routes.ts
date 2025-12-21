import { Router, RequestHandler } from 'express';
import { LeaseController } from './LeaseController';

export const createLeaseRoutes = (authMiddleware: RequestHandler) => {
  const router = Router();
  const controller = new LeaseController();

  router.use(authMiddleware);

  // Cast handlers to any to avoid strict type checking issues with Express
  router.post('/', controller.create as any);
  router.get('/', controller.list as any);
  router.get('/:id', controller.get as any);
  router.put('/:id', controller.update as any);
  router.post('/:id/terminate', controller.terminate as any);

  return router;
};
