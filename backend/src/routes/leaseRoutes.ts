import { Router } from 'express';
import { LeaseController } from '../controllers/leaseController';

export const createLeaseRoutes = (controller: LeaseController) => {
  const router = Router();

  // Basic CRUD operations
  router.get('/', controller.getAllLeases.bind(controller));
  router.get('/:id', controller.getLeaseById.bind(controller));
  router.post('/', controller.createLease.bind(controller));
  router.put('/:id', controller.updateLease.bind(controller));
  router.delete('/:id', controller.deleteLease.bind(controller));

  // Property and tenant specific routes
  router.get('/property/:propertyId', controller.getLeasesByProperty.bind(controller));
  router.get('/tenant/:tenantId', controller.getLeasesByTenant.bind(controller));

  // Status-based routes
  router.get('/status/active', controller.getActiveLeases.bind(controller));
  router.get('/expiring', controller.getExpiringLeases.bind(controller));

  // Lease management operations
  router.post('/:id/terminate', controller.terminateLease.bind(controller));
  router.post('/:id/renew', controller.renewLease.bind(controller));

  // Validation helpers
  router.post('/validate/dates', controller.validateLeaseDates.bind(controller));
  router.post('/validate/availability', controller.checkPropertyAvailability.bind(controller));
  router.post('/calculate/duration', controller.calculateLeaseDuration.bind(controller));

  return router;
};