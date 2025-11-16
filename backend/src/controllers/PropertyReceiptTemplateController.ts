import { Request, Response } from 'express';
import { IPropertyService } from '../interfaces/services/IPropertyService.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';

export class PropertyReceiptTemplateController {
  private propertyService: IPropertyService;

  constructor(propertyService: IPropertyService) {
    this.propertyService = propertyService;
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/receipt-template:
   *   post:
   *     tags: ['Property Receipt Templates']
   *     summary: Create receipt template for a property
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               bankDetails:
   *                 type: object
   *                 properties:
   *                   bankName:
   *                     type: string
   *                   accountNumber:
   *                     type: string
   *                   ifscCode:
   *                     type: string
   *                   accountHolderName:
   *                     type: string
   *               wallets:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     type:
   *                       type: string
   *                       enum: [PAYTM, PHONEPE, GPAY, AMAZONPAY, OTHER]
   *                     upiId:
   *                       type: string
   *                     upiName:
   *                       type: string
   *                     generateUPILinks:
   *                       type: boolean
   *               paymentQRCodeUrl:
   *                 type: string
   *               signatureUrl:
   *                 type: string
   *               watermarkUrl:
   *                 type: string
   *               additionalInfo:
   *                 type: object
   *                 properties:
   *                   termsAndConditions:
   *                     type: string
   *                   paymentInstructions:
   *                     type: string
   *                   contactInfo:
   *                     type: string
   *                   customFooter:
   *                     type: string
   *     responses:
   *       201:
   *         description: Receipt template created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PropertyReceiptTemplate'
   *       404:
   *         description: Property not found
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const templateData = req.body;

      const template = await this.propertyService.createPropertyReceiptTemplate(propertyId, templateData);
      ResponseUtils.created(res, template, 'Receipt template created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found') || errorMessage.includes('already exists') ||
          errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create receipt template');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/receipt-template:
   *   get:
   *     tags: ['Property Receipt Templates']
   *     summary: Get receipt template for a property
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: Receipt template details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PropertyReceiptTemplate'
   *       404:
   *         description: Property or template not found
   */
  async getTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      const template = await this.propertyService.getPropertyReceiptTemplate(propertyId);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found for this property');
      }

      ResponseUtils.success(res, template);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to fetch receipt template');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/receipt-template:
   *   put:
   *     tags: ['Property Receipt Templates']
   *     summary: Update receipt template for a property
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               bankDetails:
   *                 type: object
   *                 properties:
   *                   bankName:
   *                     type: string
   *                   accountNumber:
   *                     type: string
   *                   ifscCode:
   *                     type: string
   *                   accountHolderName:
   *                     type: string
   *               wallets:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     type:
   *                       type: string
   *                       enum: [PAYTM, PHONEPE, GPAY, AMAZONPAY, OTHER]
   *                     upiId:
   *                       type: string
   *                     upiName:
   *                       type: string
   *                     generateUPILinks:
   *                       type: boolean
   *               paymentQRCodeUrl:
   *                 type: string
   *               signatureUrl:
   *                 type: string
   *               watermarkUrl:
   *                 type: string
   *               additionalInfo:
   *                 type: object
   *                 properties:
   *                   termsAndConditions:
   *                     type: string
   *                   paymentInstructions:
   *                     type: string
   *                   contactInfo:
   *                     type: string
   *                   customFooter:
   *                     type: string
   *     responses:
   *       200:
   *         description: Receipt template updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PropertyReceiptTemplate'
   *       404:
   *         description: Property or template not found
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const updates = req.body;

      const template = await this.propertyService.updatePropertyReceiptTemplate(propertyId, updates);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found for this property');
      }

      ResponseUtils.success(res, template, 'Receipt template updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update receipt template');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/receipt-template:
   *   delete:
   *     tags: ['Property Receipt Templates']
   *     summary: Delete receipt template for a property
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: Receipt template deleted successfully
   *       404:
   *         description: Property or template not found
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      const deleted = await this.propertyService.deletePropertyReceiptTemplate(propertyId);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Receipt template not found for this property');
      }

      ResponseUtils.success(res, null, 'Receipt template deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete receipt template');
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/upi-links:
   *   get:
   *     tags: ['Property Receipt Templates']
   *     summary: Generate UPI payment links for a property
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *       - in: query
   *         name: amount
   *         schema:
   *           type: number
   *         description: Payment amount for UPI links
   *     responses:
   *       200:
   *         description: UPI payment links
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 upiLinks:
   *                   type: array
   *                   items:
   *                     type: string
   *                   description: Array of UPI payment URLs
   *       404:
   *         description: Property or template not found
   */
  async generateUPILinks(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { amount } = req.query;

      const upiLinks = await this.propertyService.generatePropertyUPILinks(
        propertyId,
        amount ? parseFloat(amount as string) : undefined
      );

      ResponseUtils.success(res, { upiLinks });
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to generate UPI links');
      }
    }
  }
}