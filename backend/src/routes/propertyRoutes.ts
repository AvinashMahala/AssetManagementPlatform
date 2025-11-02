import { Router } from 'express';
import { PropertyController } from '../controllers/propertyController';

export const createPropertyRoutes = (controller: PropertyController) => {
  const router = Router();

  router.get('/', controller.getAll.bind(controller));
  router.get('/:id', controller.getById.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));
  router.patch('/:id/status', controller.updateStatus.bind(controller));

  return router;
};