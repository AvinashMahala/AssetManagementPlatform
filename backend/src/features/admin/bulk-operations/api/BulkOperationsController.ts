import { Request, Response } from 'express';
import { BulkOperationsService } from '@/features/admin/bulk-operations/core/services/BulkOperationsService';
import { BulkRentCollectionInput, BulkPaymentInput, BulkReceiptGenerationInput, BulkCommunicationInput } from '@/features/admin/bulk-operations/core/services/BulkOperationsService';

/**
 * @swagger
 * tags:
 *   name: Bulk Operations
 *   description: Bulk operation endpoints
 */
export class BulkOperationsController {
  constructor(private bulkOperationsService: BulkOperationsService) {}

  /**
   * @swagger
   * /bulk/rent-collection:
   *   post:
   *     summary: Bulk rent collection for multiple units
   *     tags: [Bulk Operations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - unitIds
   *             properties:
   *               unitIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               dueDate:
   *                 type: string
   *                 format: date
   *     responses:
   *       200:
   *         description: Bulk rent collection completed
   *       207:
   *         description: Bulk rent collection completed with errors
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async bulkRentCollection(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkRentCollectionInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await this.bulkOperationsService.bulkRentCollection(input, userId);

      res.status(result.success ? 200 : 207).json({
        message: result.success ? 'Bulk rent collection completed' : 'Bulk rent collection completed with errors',
        ...result
      });
    } catch (error) {
      console.error('Bulk rent collection error:', error);
      res.status(500).json({
        message: 'Bulk rent collection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * @swagger
   * /bulk/payments:
   *   post:
   *     summary: Bulk payment recording for multiple transactions
   *     tags: [Bulk Operations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - payments
   *             properties:
   *               payments:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     transactionId:
   *                       type: string
   *                     amount:
   *                       type: number
   *                     paymentDate:
   *                       type: string
   *                       format: date
   *     responses:
   *       200:
   *         description: Bulk payment recording completed
   *       207:
   *         description: Bulk payment recording completed with errors
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async bulkPaymentRecording(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkPaymentInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await this.bulkOperationsService.bulkPaymentRecording(input, userId);

      res.status(result.success ? 200 : 207).json({
        message: result.success ? 'Bulk payment recording completed' : 'Bulk payment recording completed with errors',
        ...result
      });
    } catch (error) {
      console.error('Bulk payment recording error:', error);
      res.status(500).json({
        message: 'Bulk payment recording failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * @swagger
   * /bulk/receipts:
   *   post:
   *     summary: Bulk receipt generation for multiple transactions
   *     tags: [Bulk Operations]
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
   *     responses:
   *       200:
   *         description: Bulk receipt generation completed
   *       207:
   *         description: Bulk receipt generation completed with errors
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async bulkReceiptGeneration(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkReceiptGenerationInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await this.bulkOperationsService.bulkReceiptGeneration(input, userId);

      res.status(result.success ? 200 : 207).json({
        message: result.success ? 'Bulk receipt generation completed' : 'Bulk receipt generation completed with errors',
        ...result
      });
    } catch (error) {
      console.error('Bulk receipt generation error:', error);
      res.status(500).json({
        message: 'Bulk receipt generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * @swagger
   * /bulk/communication:
   *   post:
   *     summary: Bulk communication to tenants
   *     tags: [Bulk Operations]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - tenantIds
   *               - message
   *             properties:
   *               tenantIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               message:
   *                 type: string
   *               subject:
   *                 type: string
   *     responses:
   *       200:
   *         description: Bulk communication completed
   *       207:
   *         description: Bulk communication completed with errors
   *       401:
   *         description: Unauthorized
   *       500:
   *         description: Internal server error
   */
  async bulkTenantCommunication(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkCommunicationInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await this.bulkOperationsService.bulkTenantCommunication(input, userId);

      res.status(result.success ? 200 : 207).json({
        message: result.success ? 'Bulk communication completed' : 'Bulk communication completed with errors',
        ...result
      });
    } catch (error) {
      console.error('Bulk communication error:', error);
      res.status(500).json({
        message: 'Bulk communication failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * POST /api/bulk/export
   * Bulk data export
   */
  async bulkDataExport(req: Request, res: Response): Promise<void> {
    try {
      const input = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const result = await this.bulkOperationsService.bulkDataExport(input, userId);

      res.status(200).json({
        message: 'Bulk export completed',
        ...result
      });
    } catch (error) {
      console.error('Bulk export error:', error);
      res.status(500).json({
        message: 'Bulk export failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * GET /api/bulk/validate-receipts
   * Receipt validation - check for missing or invalid receipts
   */
  async validateReceipts(req: Request, res: Response): Promise<void> {
    try {
      const propertyId = req.query.propertyId as string;

      const result = await this.bulkOperationsService.validateReceipts(propertyId);

      res.status(200).json({
        message: 'Receipt validation completed',
        ...result
      });
    } catch (error) {
      console.error('Receipt validation error:', error);
      res.status(500).json({
        message: 'Receipt validation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}