import { Router } from 'express';
import { MeterController } from '../controllers/MeterController';
import { conditionalAuth, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createMeterRoutes = (controller: MeterController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all meter routes
  const auth = conditionalAuth(userService);

  // Meter CRUD routes
  router.get('/', auth, controller.getAllMeters.bind(controller));
  router.get('/:id', auth, controller.getMeterById.bind(controller));
  router.post('/', auth, controller.createMeter.bind(controller));
  router.put('/:id', auth, controller.updateMeter.bind(controller));
  router.delete('/:id', auth, controller.deleteMeter.bind(controller));
  router.patch('/:id/status', auth, controller.updateMeterStatus.bind(controller));

  // Meter reading routes
  router.get('/:meterId/readings', auth, controller.getMeterReadings.bind(controller));
  router.get('/:meterId/readings/latest', auth, controller.getLatestMeterReading.bind(controller));
  router.post('/:meterId/readings', auth, controller.createMeterReading.bind(controller));

  // Meter reading CRUD (by reading ID)
  router.put('/readings/:id', auth, controller.updateMeterReading.bind(controller));
  router.delete('/readings/:id', auth, controller.deleteMeterReading.bind(controller));

  // Analytics routes
  router.get('/:meterId/trend', auth, controller.getMeterTrend.bind(controller));
  router.get('/:meterId/statistics', auth, controller.getMeterStatistics.bind(controller));

  return router;
};