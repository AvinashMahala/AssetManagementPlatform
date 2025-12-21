import { Router } from 'express';
import { MeterController } from '../controllers/MeterController.js';

export const createMeterRoutes = (controller: MeterController, authMiddleware: any): Router => {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', controller.list.bind(controller));
  router.get('/property/:propertyId', controller.getByProperty.bind(controller));
  router.get('/unit/:unitId', controller.getByUnit.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));

  return router;
};
