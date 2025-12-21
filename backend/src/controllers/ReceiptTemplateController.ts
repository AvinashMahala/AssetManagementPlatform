import { Request, Response } from 'express';
import { ReceiptTemplateService } from '../services/ReceiptTemplateService';
import { ReceiptTemplateInput, ReceiptTemplateType } from '../models/ReceiptTemplate';
import { ResponseUtils } from '@/shared/utils/response';
import { ErrorUtils } from '@/shared/utils/error';

export class ReceiptTemplateController {
  constructor(private templateService: ReceiptTemplateService) {}

  /**
   * @swagger
   * /api/receipt-templates:
   *   get:
   *     tags: ['Receipt Templates']
   *     summary: Get all receipt templates
   *     responses:
   *       200:
   *         description: List of receipt templates
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 templates:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ReceiptTemplate'
   */
  async getAllTemplates(req: Request, res: Response) {
    try {
      const templates = await this.templateService.getAllTemplates();
      ResponseUtils.success(res, { templates });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates/{id}:
   *   get:
   *     tags: ['Receipt Templates']
   *     summary: Get receipt template by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     responses:
   *       200:
   *         description: Receipt template details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ReceiptTemplate'
   *       404:
   *         description: Template not found
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const template = await this.templateService.getTemplateById(id);

      if (!template) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates/type/{type}:
   *   get:
   *     tags: ['Receipt Templates']
   *     summary: Get receipt template by type
   *     parameters:
   *       - in: path
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [basic, professional, premium]
   *         description: Template type
   *     responses:
   *       200:
   *         description: Receipt template details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ReceiptTemplate'
   *       404:
   *         description: Template not found
   */
  async getTemplateByType(req: Request, res: Response) {
    try {
      const { type } = req.params;

      if (!Object.values(ReceiptTemplateType).includes(type as ReceiptTemplateType)) {
        return ResponseUtils.badRequest(res, 'Invalid template type');
      }

      const template = await this.templateService.getTemplateByType(type as ReceiptTemplateType);

      if (!template) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates:
   *   post:
   *     tags: ['Receipt Templates']
   *     summary: Create a new receipt template
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ReceiptTemplateInput'
   *     responses:
   *       201:
   *         description: Template created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ReceiptTemplate'
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const templateData: ReceiptTemplateInput = req.body;
      const template = await this.templateService.createTemplate(templateData);
      ResponseUtils.created(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates/{id}:
   *   put:
   *     tags: ['Receipt Templates']
   *     summary: Update receipt template
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               defaultSettings:
   *                 $ref: '#/components/schemas/ReceiptTemplateSettings'
   *               isActive:
   *                 type: boolean
   *               isDefault:
   *                 type: boolean
   *               sortOrder:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Template updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ReceiptTemplate'
   *       404:
   *         description: Template not found
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const template = await this.templateService.updateTemplate(id, updateData);

      if (!template) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates/{id}:
   *   delete:
   *     tags: ['Receipt Templates']
   *     summary: Delete receipt template
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     responses:
   *       200:
   *         description: Template deleted successfully
   *       404:
   *         description: Template not found
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.templateService.deleteTemplate(id);

      if (!deleted) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { message: 'Template deleted successfully' });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates/default:
   *   get:
   *     tags: ['Receipt Templates']
   *     summary: Get default receipt template
   *     responses:
   *       200:
   *         description: Default template details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ReceiptTemplate'
   *       404:
   *         description: No default template found
   */
  async getDefaultTemplate(req: Request, res: Response) {
    try {
      const template = await this.templateService.getDefaultTemplate();

      if (!template) {
        return ResponseUtils.notFound(res, 'No default template found');
      }

      ResponseUtils.success(res, { template });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates/{id}/default:
   *   put:
   *     tags: ['Receipt Templates']
   *     summary: Set template as default
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     responses:
   *       200:
   *         description: Template set as default successfully
   */
  async setDefaultTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await this.templateService.setDefaultTemplate(id);

      if (!success) {
        return ResponseUtils.notFound(res, 'Template not found');
      }

      ResponseUtils.success(res, { message: 'Template set as default successfully' });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/receipt-templates/available:
   *   get:
   *     tags: ['Receipt Templates']
   *     summary: Get available (active) receipt templates
   *     responses:
   *       200:
   *         description: List of available templates
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 templates:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/ReceiptTemplate'
   */
  async getAvailableTemplates(req: Request, res: Response) {
    try {
      const templates = await this.templateService.getAvailableTemplates();
      ResponseUtils.success(res, { templates });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/template:
   *   get:
   *     tags: ['Property Templates']
   *     summary: Get property template settings
   *     parameters:
   *       - in: path
   *         name: propertyId
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: Property template settings
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ReceiptTemplateSettings'
   */
  async getPropertyTemplateSettings(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const settings = await this.templateService.getPropertyTemplateSettings(propertyId);

      if (!settings) {
        return ResponseUtils.notFound(res, 'No template settings found for property');
      }

      ResponseUtils.success(res, { settings });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }

  /**
   * @swagger
   * /api/properties/{propertyId}/template:
   *   put:
   *     tags: ['Property Templates']
   *     summary: Set property template
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
   *               - templateId
   *             properties:
   *               templateId:
   *                 type: string
   *                 description: Template ID to assign
   *               overrides:
   *                 $ref: '#/components/schemas/ReceiptTemplateSettings'
   *                 description: Property-specific overrides
   *     responses:
   *       200:
   *         description: Property template set successfully
   */
  async setPropertyTemplate(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;
      const { templateId, overrides } = req.body;

      if (!templateId) {
        return ResponseUtils.badRequest(res, 'Template ID is required');
      }

      const success = await this.templateService.setPropertyTemplate(propertyId, templateId, overrides);

      if (!success) {
        return ResponseUtils.notFound(res, 'Property or template not found');
      }

      ResponseUtils.success(res, { message: 'Property template set successfully' });
    } catch (error) {
      ErrorUtils.handleGenericError(res, error);
    }
  }
}