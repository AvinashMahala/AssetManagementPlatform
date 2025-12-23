import { Response } from 'express';
import { Pool } from 'pg';
import { TemplateCustomizationService } from '../core/services/TemplateCustomizationService';
import { HTTP_STATUS } from '@/shared/constants/http';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Templates
 *   description: Template customization endpoints
 */
export class TemplateController {
  private service: TemplateCustomizationService;

  constructor(pool: Pool) {
    this.service = new TemplateCustomizationService(pool);
  }

  /**
   * @swagger
   * /templates:
   *   get:
   *     summary: Get all templates
   *     tags: [Templates]
   *     responses:
   *       200:
   *         description: List of templates
   *       500:
   *         description: Internal server error
   */
  getAllTemplates = async (req: any, res: Response) => {
    try {
      const templates = await this.service.getAllTemplates();
      res.status(HTTP_STATUS.OK).json({ success: true, data: templates });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch templates',
        error: error.message 
      });
    }
  };

  /**
   * @swagger
   * /templates/{id}:
   *   get:
   *     summary: Get a template by ID
   *     tags: [Templates]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Template ID
   *     responses:
   *       200:
   *         description: Template details
   *       404:
   *         description: Template not found
   *       500:
   *         description: Internal server error
   */
  getTemplateById = async (req: any, res: Response) => {
    try {
      const template = await this.service.getTemplateById(req.params.id);
      if (!template) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ 
          success: false, 
          message: 'Template not found' 
        });
      }
      res.status(HTTP_STATUS.OK).json({ success: true, data: template });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch template',
        error: error.message 
      });
    }
  };

  /**
   * @swagger
   * /templates/property/{propertyId}/settings:
   *   get:
   *     summary: Get template settings for a property
   *     tags: [Templates]
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
   *       500:
   *         description: Internal server error
   */
  getPropertyTemplateSettings = async (req: any, res: Response) => {
    try {
      const settings = await this.service.getPropertyTemplateSettings(req.params.propertyId);
      res.status(HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch property template settings',
        error: error.message 
      });
    }
  };

  /**
   * @swagger
   * /templates/property/{propertyId}/settings:
   *   put:
   *     summary: Update template settings for a property
   *     tags: [Templates]
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
   *     responses:
   *       200:
   *         description: Settings updated successfully
   *       500:
   *         description: Internal server error
   */
  updatePropertyTemplateSettings = async (req: any, res: Response) => {
    try {
      const settings = await this.service.updatePropertyTemplateSettings(req.params.propertyId, req.body);
      res.status(HTTP_STATUS.OK).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to update property template settings',
        error: error.message 
      });
    }
  };

  /**
   * @swagger
   * /templates/placeholders:
   *   get:
   *     summary: Get available placeholders
   *     tags: [Templates]
   *     responses:
   *       200:
   *         description: List of available placeholders
   *       500:
   *         description: Internal server error
   */
  getAvailablePlaceholders = async (req: any, res: Response) => {
    try {
      const placeholders = this.service.getAvailablePlaceholders();
      res.status(HTTP_STATUS.OK).json({ success: true, data: placeholders });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to fetch placeholders',
        error: error.message 
      });
    }
  };

  /**
   * @swagger
   * /templates/{id}/preview:
   *   post:
   *     summary: Generate a preview of a template
   *     tags: [Templates]
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
   *             required:
   *               - propertyId
   *             properties:
   *               propertyId:
   *                 type: string
   *               sampleData:
   *                 type: object
   *               customizations:
   *                 type: object
   *               format:
   *                 type: string
   *                 default: html
   *     responses:
   *       200:
   *         description: Template preview generated
   *       500:
   *         description: Internal server error
   */
  generatePreview = async (req: any, res: Response) => {
    try {
      const previewRequest = {
        templateId: req.params.id,
        propertyId: req.body.propertyId,
        sampleData: req.body.sampleData,
        customizations: req.body.customizations,
        format: req.body.format || 'html',
      };
      
      const preview = await this.service.generatePreview(previewRequest);
      
      if (preview.success) {
        res.status(HTTP_STATUS.OK).json({ success: true, data: preview });
      } else {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
          success: false, 
          message: preview.error 
        });
      }
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to generate preview',
        error: error.message 
      });
    }
  };

  exportTemplate = async (req: any, res: Response) => {
    try {
      const exportData = await this.service.exportTemplate(req.params.id);
      res.status(HTTP_STATUS.OK).json(exportData);
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to export template',
        error: error.message 
      });
    }
  };

  importTemplate = async (req: any, res: Response) => {
    try {
      const newTemplateId = await this.service.importTemplate(req.body, req.user?.id || process.env.DEV_USER_ID || process.env.SYSTEM_USER_ID);
      res.status(HTTP_STATUS.CREATED).json({ 
        success: true, 
        data: { id: newTemplateId },
        message: 'Template imported successfully'
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        success: false, 
        message: 'Failed to import template',
        error: error.message 
      });
    }
  };

  duplicateTemplate = async (req: any, res: Response) => {
    try {
      const { name } = req.body;
      const newTemplateId = await this.service.duplicateTemplate(req.params.id, name);
      res.status(HTTP_STATUS.CREATED).json({ 
        success: true, 
        data: { id: newTemplateId },
        message: 'Template duplicated successfully'
      });
    } catch (error: any) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: 'Failed to duplicate template',
        error: error.message 
      });
    }
  };
}
