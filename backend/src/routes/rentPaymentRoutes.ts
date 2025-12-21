import { Router } from 'express';
import { RentPaymentController } from '../controllers/RentPaymentController';
import { conditionalAuth } from '@/shared/middleware/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createRentPaymentRoutes = (controller: RentPaymentController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Basic CRUD operations
  router.get('/', auth, controller.getAllPayments.bind(controller));
  router.get('/:id', auth, controller.getPaymentById.bind(controller));
  router.post('/', auth, controller.createPayment.bind(controller));
  router.put('/:id', auth, controller.updatePayment.bind(controller));
  router.delete('/bulk-delete', auth, controller.deletePayments.bind(controller));
  router.delete('/:id', auth, controller.deletePayment.bind(controller));

  // Relationship-based routes
  router.get('/lease/:leaseId', auth, controller.getPaymentsByLease.bind(controller));
  router.get('/property/:propertyId', auth, controller.getPaymentsByProperty.bind(controller));
  router.get('/tenant/:tenantId', auth, controller.getPaymentsByTenant.bind(controller));

  // Status-based routes
  router.get('/status/pending', auth, controller.getPendingPayments.bind(controller));
  router.get('/status/overdue', auth, controller.getOverduePayments.bind(controller));

  // Date range queries
  router.get('/date-range', auth, controller.getPaymentsByDateRange.bind(controller));

  // Payment operations
  router.post('/:id/mark-paid', auth, controller.markPaymentAsPaid.bind(controller));

  // Financial calculations and reports
  router.post('/calculate/late-fees', auth, controller.calculateLateFees.bind(controller));
  router.post('/generate/monthly', auth, controller.generateMonthlyPayments.bind(controller));

  // Revenue reports
  router.get('/revenue/property/:propertyId', auth, controller.getTotalRevenueByProperty.bind(controller));
  router.get('/revenue/owner/:ownerId', auth, controller.getTotalRevenueByOwner.bind(controller));
  router.get('/revenue/outstanding', auth, controller.getOutstandingPayments.bind(controller));
  router.get('/revenue/monthly/:year/:month', auth, controller.getMonthlyRevenueReport.bind(controller));

  return router;
};