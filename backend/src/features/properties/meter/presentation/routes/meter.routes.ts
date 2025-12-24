import { Router, RequestHandler } from 'express';
import { MeterController } from '../controllers/MeterController.js';
import { asyncHandler } from '@/shared/middleware/errorHandler';

export const createMeterRoutes = (controller: MeterController, authMiddleware: RequestHandler): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', asyncHandler(controller.list.bind(controller)));
  router.get('/property/:propertyId', asyncHandler(controller.getByProperty.bind(controller)));
  router.get('/unit/:unitId', asyncHandler(controller.getByUnit.bind(controller)));
  router.post('/', asyncHandler(controller.create.bind(controller)));
  router.put('/:id', asyncHandler(controller.update.bind(controller)));
  router.delete('/:id', asyncHandler(controller.delete.bind(controller)));

  return router;
};
