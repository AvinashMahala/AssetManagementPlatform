import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware.js';
import { IReceiptService } from '@/features/finance/receipt/core/interfaces/IReceiptRepository';
import { ReceiptGenerationRequest, BulkReceiptGenerationRequest } from '@/features/finance/receipt/core/receipt.types';
import { createModuleLogger, PerformanceLogger } from '@/shared/utils/logger.js';
import { AppError } from '@/shared/middleware/errorHandler.js';

const logger = createModuleLogger('ReceiptController');

/**
 * @swagger
 * tags:
 *   name: Receipts
 *   description: Receipt management endpoints
 */
export class ReceiptController {
  constructor(private receiptService: IReceiptService) {}

  /**
   * @swagger
   * /receipts:
   *   get:
   *     summary: Get all receipts
   *     tags: [Receipts]
   *     responses:
   *       200:
   *         description: List of receipts
   *       500:
   *         description: Internal server error
   */
  async getAllReceipts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const perfLogger = new PerformanceLogger('getAllReceipts', {
      userId: req.user?.id,
    });

    try {
      logger.info('Fetching all receipts');
      const receipts = await this.receiptService.getAllReceipts();
      
      logger.info('Successfully fetched receipts', { count: receipts.length });
      perfLogger.end({ count: receipts.length });
      
      res.json({
        success: true,
        data: receipts
      });
    } catch (error) {
      logger.error('Failed to fetch receipts', error);
      perfLogger.endWithError(error as Error);
      
      throw new AppError('Failed to fetch receipts', 500);
    }
  }

  /**
   * @swagger
   * /receipts/{id}:
   *   get:
   *     summary: Get a receipt by ID
   *     tags: [Receipts]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Receipt ID
   *     responses:
   *       200:
   *         description: Receipt details
   *       404:
   *         description: Receipt not found
   *       500:
   *         description: Internal server error
   */
  async getReceiptById(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const perfLogger = new PerformanceLogger('getReceiptById', {
      receiptId: id,
      userId: req.user?.id,
    });

    try {
      logger.info('Fetching receipt by ID', { receiptId: id });
      const receipt = await this.receiptService.getReceiptById(id);

      if (!receipt) {
        logger.warn('Receipt not found', { receiptId: id });
        perfLogger.end({ found: false });
        
        throw new AppError('Receipt not found', 404, true, 'RECEIPT_NOT_FOUND');
      }

      logger.info('Successfully fetched receipt', { receiptId: id });
      perfLogger.end({ found: true });
      
      res.json({
        success: true,
        data: receipt
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error('Failed to fetch receipt by ID', error, { receiptId: id });
      perfLogger.endWithError(error as Error);
      
      throw new AppError('Failed to fetch receipt', 500);
    }
  }

  /**
   * @swagger
   * /receipts/number/{receiptNumber}:
   *   get:
   *     summary: Get a receipt by receipt number
   *     tags: [Receipts]
   *     parameters:
   *       - in: path
   *         name: receiptNumber
   *         required: true
   *         schema:
   *           type: string
   *         description: Receipt Number
   *     responses:
   *       200:
   *         description: Receipt details
   *       404:
   *         description: Receipt not found
   *       500:
   *         description: Internal server error
   */
  async getReceiptByNumber(req: Request, res: Response): Promise<void> {
    try {
      const { receiptNumber } = req.params;
      const receipt = await this.receiptService.getReceiptByNumber(receiptNumber);

      if (!receipt) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found'
        });
        return;
      }

      res.json({
        success: true,
        data: receipt
      });
    } catch (error) {
      console.error('Error fetching receipt by number:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch receipt'
      });
    }
  }

  /**
   * @swagger
   * /receipts/property/{propertyId}:
   *   get:
   *     summary: Get receipts by Property ID
   *     tags: [Receipts]
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: List of receipts for the property
   *       500:
   *         description: Internal server error
   */
  async getReceiptsByProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const receipts = await this.receiptService.getReceiptsByProperty(propertyId);

      res.json({
        success: true,
        data: receipts
      });
    } catch (error) {
      console.error('Error fetching receipts by property:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch receipts'
      });
    }
  }

  async getReceiptsByTenant(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;
      const receipts = await this.receiptService.getReceiptsByTenant(tenantId);

      res.json({
        success: true,
        data: receipts
      });
    } catch (error) {
      console.error('Error fetching receipts by tenant:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch receipts'
      });
    }
  }

  async generateReceipt(req: Request, res: Response): Promise<void> {
    try {
      const request: ReceiptGenerationRequest = req.body;

      // Validate required fields
      if (!request.paymentId) {
        res.status(400).json({
          success: false,
          message: 'paymentId is required'
        });
        return;
      }

      const receipt = await this.receiptService.generateReceipt(request);

      res.status(201).json({
        success: true,
        data: receipt,
        message: 'Receipt generated successfully'
      });
    } catch (error) {
      console.error('Error generating receipt:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      res.status(500).json({
        success: false,
        message: 'Failed to generate receipt',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async generateBulkReceipts(req: Request, res: Response): Promise<void> {
    try {
      const request: BulkReceiptGenerationRequest = req.body;

      // Validate required fields
      if (!request.propertyId || !request.month || !request.year) {
        res.status(400).json({
          success: false,
          message: 'propertyId, month, and year are required'
        });
        return;
      }

      const receipts = await this.receiptService.generateBulkReceipts(request);

      res.status(201).json({
        success: true,
        data: receipts,
        message: `${receipts.length} receipts generated successfully`
      });
    } catch (error) {
      console.error('Error generating bulk receipts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate bulk receipts'
      });
    }
  }

  async updateReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const receipt = await this.receiptService.updateReceipt(id, updateData);

      if (!receipt) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found'
        });
        return;
      }

      res.json({
        success: true,
        data: receipt,
        message: 'Receipt updated successfully'
      });
    } catch (error) {
      console.error('Error updating receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update receipt'
      });
    }
  }

  async deleteReceipt(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.receiptService.deleteReceipt(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Receipt deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete receipt'
      });
    }
  }

  async sendReceiptByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
        return;
      }

      const sent = await this.receiptService.sendReceiptByEmail(id, email);

      if (!sent) {
        res.status(404).json({
          success: false,
          message: 'Receipt not found or failed to send'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Receipt sent successfully'
      });
    } catch (error) {
      console.error('Error sending receipt by email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send receipt'
      });
    }
  }

  async downloadReceiptPDF(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pdfBuffer = await this.receiptService.downloadReceiptPDF(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error downloading receipt PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download receipt PDF'
      });
    }
  }

  async updatePropertyReceiptSettings(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const settings = req.body;

      const updated = await this.receiptService.updatePropertyReceiptSettings(propertyId, settings);

      if (!updated) {
        res.status(404).json({
          success: false,
          message: 'Property not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Receipt settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating receipt settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update receipt settings'
      });
    }
  }

  async getPropertyReceiptSettings(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      const settings = await this.receiptService.getPropertyReceiptSettings(propertyId);

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching receipt settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch receipt settings'
      });
    }
  }
}