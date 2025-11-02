import { Router } from 'express';
import { RentPaymentController } from '../controllers/RentPaymentController';

export const createRentPaymentRoutes = (controller: RentPaymentController) => {
  const router = Router();

  // Basic CRUD operations
  router.get('/', controller.getAllPayments.bind(controller));
  router.get('/:id', controller.getPaymentById.bind(controller));
  router.post('/', controller.createPayment.bind(controller));
  router.put('/:id', controller.updatePayment.bind(controller));
  router.delete('/:id', controller.deletePayment.bind(controller));

  // Relationship-based routes
  router.get('/lease/:leaseId', controller.getPaymentsByLease.bind(controller));
  router.get('/property/:propertyId', controller.getPaymentsByProperty.bind(controller));
  router.get('/tenant/:tenantId', controller.getPaymentsByTenant.bind(controller));

  // Status-based routes
  router.get('/status/pending', controller.getPendingPayments.bind(controller));
  router.get('/status/overdue', controller.getOverduePayments.bind(controller));

  // Date range queries
  router.get('/date-range', controller.getPaymentsByDateRange.bind(controller));

  // Payment operations
  router.post('/:id/mark-paid', controller.markPaymentAsPaid.bind(controller));

  // Financial calculations and reports
  router.post('/calculate/late-fees', controller.calculateLateFees.bind(controller));
  router.post('/generate/monthly', controller.generateMonthlyPayments.bind(controller));

  // Revenue reports
  router.get('/revenue/property/:propertyId', controller.getTotalRevenueByProperty.bind(controller));
  router.get('/revenue/owner/:ownerId', controller.getTotalRevenueByOwner.bind(controller));
  router.get('/revenue/outstanding', controller.getOutstandingPayments.bind(controller));
  router.get('/revenue/monthly/:year/:month', controller.getMonthlyRevenueReport.bind(controller));

  return router;
};