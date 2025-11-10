import { Router } from 'express';
import { RentTransactionController } from '../controllers/RentTransactionController';
import { conditionalAuth } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createRentTransactionRoutes = (controller: RentTransactionController, userService: IUserService) => {
  const router = Router();
  const auth = conditionalAuth(userService);

  // Basic CRUD operations
  router.get('/', auth, controller.getAllTransactions.bind(controller));
  router.get('/:id', auth, controller.getTransactionById.bind(controller));
  router.post('/', auth, controller.createTransaction.bind(controller));
  router.put('/:id', auth, controller.updateTransaction.bind(controller));
  router.delete('/:id', auth, controller.deleteTransaction.bind(controller));

  // Relationship-based routes
  router.get('/lease/:leaseId', auth, controller.getTransactionsByLease.bind(controller));
  router.get('/property/:propertyId', auth, controller.getTransactionsByProperty.bind(controller));
  router.get('/tenant/:tenantId', auth, controller.getTransactionsByTenant.bind(controller));

  // Status-based routes
  router.get('/status/pending', auth, controller.getPendingTransactions.bind(controller));
  router.get('/status/overdue', auth, controller.getOverdueTransactions.bind(controller));

  // Date range queries
  router.get('/date-range', auth, controller.getTransactionsByDateRange.bind(controller));

  // Transaction operations
  router.post('/:id/mark-paid', auth, controller.markTransactionAsPaid.bind(controller));

  // Financial calculations and reports
  router.post('/calculate/late-fees', auth, controller.calculateLateFees.bind(controller));
  router.post('/generate/monthly', auth, controller.generateMonthlyTransactions.bind(controller));

  // Balance tracking
  router.get('/balance/lease/:leaseId', auth, controller.getCurrentBalanceByLease.bind(controller));
  router.get('/balance/tenant/:tenantId', auth, controller.getCurrentBalanceByTenant.bind(controller));
  router.get('/balance/property/:propertyId', auth, controller.getCurrentBalanceByProperty.bind(controller));

  // Revenue reports
  router.get('/revenue/property/:propertyId', auth, controller.getTotalRevenueByProperty.bind(controller));
  router.get('/revenue/owner/:ownerId', auth, controller.getTotalRevenueByOwner.bind(controller));
  router.get('/revenue/outstanding', auth, controller.getOutstandingTransactions.bind(controller));
  router.get('/revenue/monthly/:year/:month', auth, controller.getMonthlyRevenueReport.bind(controller));

  // Utility revenue reports
  router.get('/utility-revenue/property/:propertyId', auth, controller.getUtilityRevenueByProperty.bind(controller));
  router.get('/utility-revenue/unit/:unitId', auth, controller.getUtilityRevenueByUnit.bind(controller));
  router.get('/utility-revenue/summary', auth, controller.getUtilityRevenueSummary.bind(controller));

  // MVP-specific routes
  router.get('/unit/:unitId/current-month', auth, controller.getCurrentMonthTransaction.bind(controller));
  router.get('/unit/:unitId/history', auth, controller.getUnitHistory.bind(controller));
  router.get('/unit/:unitId/last-meter-readings', auth, controller.getLastMeterReadings.bind(controller));
  router.post('/:id/record-payment', auth, controller.recordPayment.bind(controller));
  router.post('/generate-invoice', auth, controller.generateInvoice.bind(controller));
  router.post('/generate-receipt', auth, controller.generateReceipt.bind(controller));
  router.get('/:id/preview-invoice', auth, controller.previewInvoice.bind(controller));
  router.get('/:id/preview-receipt', auth, controller.previewReceipt.bind(controller));
  router.get('/property/:propertyId/monthly-summary', auth, controller.getMonthlySummary.bind(controller));

  return router;
};