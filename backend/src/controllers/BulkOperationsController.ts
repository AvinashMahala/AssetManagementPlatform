import { Request, Response } from 'express';
import { BulkOperationsService } from '../services/BulkOperationsService';
import { BulkRentCollectionInput, BulkPaymentInput, BulkReceiptGenerationInput, BulkCommunicationInput } from '../services/BulkOperationsService';

export class BulkOperationsController {
  constructor(private bulkOperationsService: BulkOperationsService) {}

  /**
   * POST /api/bulk/rent-collection
   * Bulk rent collection for multiple units
   */
  async bulkRentCollection(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkRentCollectionInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;

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
   * POST /api/bulk/payments
   * Bulk payment recording for multiple transactions
   */
  async bulkPaymentRecording(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkPaymentInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;

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
   * POST /api/bulk/receipts
   * Bulk receipt generation for multiple transactions
   */
  async bulkReceiptGeneration(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkReceiptGenerationInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;

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
   * POST /api/bulk/communication
   * Bulk communication to tenants
   */
  async bulkTenantCommunication(req: Request, res: Response): Promise<void> {
    try {
      const input: BulkCommunicationInput = req.body;
      const userId = req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID;

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