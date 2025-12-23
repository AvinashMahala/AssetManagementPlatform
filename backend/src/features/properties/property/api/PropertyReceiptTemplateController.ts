import { Request, Response } from 'express';
import { GetPropertyByIdUseCase } from '../core/use-cases/GetPropertyById.usecase.js';
import { PropertyReceiptTemplateService } from '../core/services/PropertyReceiptTemplateService';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

/**
 * @swagger
 * tags:
 *   name: PropertyReceiptTemplates
 *   description: Property receipt template management endpoints
 */
export class PropertyReceiptTemplateController {
  constructor(
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private propertyReceiptTemplateService: PropertyReceiptTemplateService
  ) {}

  /**
   * @swagger
   * /properties/{propertyId}/receipt-template:
   *   post:
   *     summary: Create a receipt template for a property
   *     tags: [PropertyReceiptTemplates]
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
   *             required:
   *               - templateName
   *             properties:
   *               templateName:
   *                 type: string
   *               headerText:
   *                 type: string
   *               footerText:
   *                 type: string
   *               logoUrl:
   *                 type: string
   *               wallets:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     type:
   *                       type: string
   *                     address:
   *                       type: string
   *     responses:
   *       201:
   *         description: Receipt template created successfully
   *       400:
   *         description: Invalid input or template already exists
   *       404:
   *         description: Property not found
   *       500:
   *         description: Internal server error
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const templateData = req.body;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.createTemplate(propertyId, templateData);
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
   * /properties/{propertyId}/receipt-template:
   *   get:
   *     summary: Get receipt template for a property
   *     tags: [PropertyReceiptTemplates]
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
   *       404:
   *         description: Property or template not found
   *       500:
   *         description: Internal server error
   */
  async getTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.getTemplateByPropertyId(propertyId);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      ResponseUtils.success(res, template);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch receipt template');
    }
  }

  /**
   * @swagger
   * /properties/{propertyId}/receipt-template:
   *   put:
   *     summary: Update a receipt template
   *     tags: [PropertyReceiptTemplates]
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
   *               templateName:
   *                 type: string
   *               headerText:
   *                 type: string
   *               footerText:
   *                 type: string
   *               logoUrl:
   *                 type: string
   *               wallets:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     type:
   *                       type: string
   *                     address:
   *                       type: string
   *     responses:
   *       200:
   *         description: Receipt template updated successfully
   *       404:
   *         description: Property or template not found
   *       500:
   *         description: Internal server error
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const updates = req.body;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.updateTemplate(propertyId, updates);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      ResponseUtils.success(res, template, 'Receipt template updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('not found') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update receipt template');
      }
    }
  }

  /**
   * @swagger
   * /properties/{propertyId}/receipt-template:
   *   delete:
   *     summary: Delete a receipt template
   *     tags: [PropertyReceiptTemplates]
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
   *       500:
   *         description: Internal server error
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const result = await this.propertyReceiptTemplateService.deleteTemplate(propertyId);
      if (!result) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      ResponseUtils.success(res, null, 'Receipt template deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete receipt template');
    }
  }

  /**
   * @swagger
   * /properties/{propertyId}/receipt-template/upi-links:
   *   get:
   *     summary: Generate UPI links for a property
   *     tags: [PropertyReceiptTemplates]
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
   *         description: Amount for UPI link
   *     responses:
   *       200:
   *         description: List of UPI links
   *       404:
   *         description: Property or template not found
   *       500:
   *         description: Internal server error
   */
  async generateUPILinks(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { amount } = req.query;

      // Verify property exists
      const property = await this.getPropertyByIdUseCase.execute(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      const template = await this.propertyReceiptTemplateService.getTemplateByPropertyId(propertyId);
      if (!template) {
        return ResponseUtils.notFound(res, 'Receipt template not found');
      }

      const links = this.propertyReceiptTemplateService.generateUPILinks(template.wallets, amount ? Number(amount) : undefined);
      ResponseUtils.success(res, links);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to generate UPI links');
    }
  }
}
