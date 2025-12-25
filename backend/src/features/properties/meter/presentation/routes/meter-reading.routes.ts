import { Router, RequestHandler } from 'express';
import { MeterReadingController } from '../controllers/MeterReadingController';
import { asyncHandler } from '@/shared/middleware/errorHandler';

export const createMeterReadingRoutes = (controller: MeterReadingController, authMiddleware: RequestHandler): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', asyncHandler(controller.getAll.bind(controller)));
  router.get('/:id', asyncHandler(controller.getById.bind(controller)));
  router.get('/meter/:meterId', asyncHandler(controller.getByMeter.bind(controller)));
  router.post('/', asyncHandler(controller.create.bind(controller)));
  router.put('/:id', asyncHandler(controller.update.bind(controller)));
  router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

  return router;
};
