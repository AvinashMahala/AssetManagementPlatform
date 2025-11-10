import { Router } from 'express';
import { BulkOperationsController } from '../controllers/BulkOperationsController';
import { conditionalAuth, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { IUserService } from '../interfaces/services/IUserService';

export const createBulkOperationsRoutes = (controller: BulkOperationsController, userService: IUserService) => {
  const router = Router();

  // Apply conditional auth to all bulk operations routes
  const auth = conditionalAuth(userService);

/**
 * @swagger
 * /api/bulk/rent-collection:
 *   post:
 *     summary: Bulk rent collection for multiple units
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitIds
 *               - billingPeriodStart
 *               - billingPeriodEnd
 *             properties:
 *               unitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               billingPeriodStart:
 *                 type: string
 *                 format: date
 *               billingPeriodEnd:
 *                 type: string
 *                 format: date
 *               applyExpenses:
 *                 type: boolean
 *               expenseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               skipUnitsWithExistingTransactions:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bulk rent collection completed successfully
 *       207:
 *         description: Bulk rent collection completed with some errors
 *       500:
 *         description: Server error
 */
router.post('/rent-collection', auth, async (req, res) => {
  const controller = req.app.locals.bulkOperationsController as BulkOperationsController;
  await controller.bulkRentCollection(req, res);
});

/**
 * @swagger
 * /api/bulk/payments:
 *   post:
 *     summary: Bulk payment recording for multiple transactions
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionIds
 *               - amount
 *               - paymentMethod
 *               - paymentDate
 *             properties:
 *               transactionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               paymentDate:
 *                 type: string
 *                 format: date
 *               paymentReference:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bulk payment recording completed successfully
 *       207:
 *         description: Bulk payment recording completed with some errors
 *       500:
 *         description: Server error
 */
router.post('/payments', auth, async (req, res) => {
  const controller = req.app.locals.bulkOperationsController as BulkOperationsController;
  await controller.bulkPaymentRecording(req, res);
});

/**
 * @swagger
 * /api/bulk/receipts:
 *   post:
 *     summary: Bulk receipt generation for multiple transactions
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionIds
 *             properties:
 *               transactionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               regenerateExisting:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bulk receipt generation completed successfully
 *       207:
 *         description: Bulk receipt generation completed with some errors
 *       500:
 *         description: Server error
 */
router.post('/receipts', auth, async (req, res) => {
  const controller = req.app.locals.bulkOperationsController as BulkOperationsController;
  await controller.bulkReceiptGeneration(req, res);
});

/**
 * @swagger
 * /api/bulk/communication:
 *   post:
 *     summary: Bulk communication to tenants
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantIds
 *               - subject
 *               - message
 *               - channels
 *             properties:
 *               tenantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [email, sms, whatsapp]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Bulk communication completed successfully
 *       207:
 *         description: Bulk communication completed with some errors
 *       500:
 *         description: Server error
 */
router.post('/communication', auth, async (req, res) => {
  const controller = req.app.locals.bulkOperationsController as BulkOperationsController;
  await controller.bulkTenantCommunication(req, res);
});

/**
 * @swagger
 * /api/bulk/export:
 *   post:
 *     summary: Bulk data export
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entityType
 *               - format
 *             properties:
 *               entityType:
 *                 type: string
 *                 enum: [properties, units, tenants, transactions, payments, receipts]
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date
 *                   end:
 *                     type: string
 *                     format: date
 *               propertyIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               unitIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               tenantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               format:
 *                 type: string
 *                 enum: [csv, excel, json, pdf]
 *     responses:
 *       200:
 *         description: Bulk export completed successfully
 *       500:
 *         description: Server error
 */
router.post('/export', auth, async (req, res) => {
  const controller = req.app.locals.bulkOperationsController as BulkOperationsController;
  await controller.bulkDataExport(req, res);
});

/**
 * @swagger
 * /api/bulk/validate-receipts:
 *   get:
 *     summary: Validate receipts for missing or invalid files
 *     tags: [Bulk Operations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Optional property ID to filter validation
 *     responses:
 *       200:
 *         description: Receipt validation completed
 *       500:
 *         description: Server error
 */
router.get('/validate-receipts', auth, async (req, res) => {
  const controller = req.app.locals.bulkOperationsController as BulkOperationsController;
  await controller.validateReceipts(req, res);
});

  return router;
};