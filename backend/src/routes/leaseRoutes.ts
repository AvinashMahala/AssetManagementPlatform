import { Router } from 'express';
import { LeaseController } from '../controllers/leaseController';
import { conditionalAuth } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createLeaseRoutes = (controller: LeaseController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Basic CRUD operations
  router.get('/', auth, controller.getAllLeases.bind(controller));
  router.get('/:id', auth, controller.getLeaseById.bind(controller));
  router.post('/', auth, controller.createLease.bind(controller));
  router.put('/:id', auth, controller.updateLease.bind(controller));
  router.delete('/:id', auth, controller.deleteLease.bind(controller));

  // Property and tenant specific routes
  router.get('/property/:propertyId', auth, controller.getLeasesByProperty.bind(controller));
  router.get('/tenant/:tenantId', auth, controller.getLeasesByTenant.bind(controller));

  // Status-based routes
  router.get('/status/active', auth, controller.getActiveLeases.bind(controller));
  router.get('/expiring', auth, controller.getExpiringLeases.bind(controller));

  // Lease management operations
  router.post('/:id/terminate', auth, controller.terminateLease.bind(controller));
  router.post('/:id/renew', auth, controller.renewLease.bind(controller));

  // Validation helpers
  router.post('/validate/dates', auth, controller.validateLeaseDates.bind(controller));
  router.post('/validate/availability', auth, controller.checkPropertyAvailability.bind(controller));
  router.post('/calculate/duration', auth, controller.calculateLeaseDuration.bind(controller));

  return router;
};