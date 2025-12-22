import { Router } from 'express';
import { MeterReadingController } from '../controllers/MeterReadingController';

export const createMeterReadingRoutes = (controller: MeterReadingController, authMiddleware: any): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', controller.getAll.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.get('/meter/:meterId', controller.getByMeter.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));

  return router;
};
