import { Request, Response } from 'express';
import { IPropertyService } from '../interfaces/services/IPropertyService.js';
import { PropertyInput } from '../models/Property.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';
import { createModuleLogger } from '../utils/logger.js';

const logger = createModuleLogger('PropertyController');

export class PropertyController {
  private service: IPropertyService;

  constructor(service: IPropertyService) {
    this.service = service;
  }

  /**
   * @swagger
   * /api/properties:
   *   get:
   *     tags: ['Properties']
   *     summary: Get all properties
   *     parameters:
   *       - in: query
   *         name: ownerId
   *         schema:
   *           type: string
   *         description: Filter properties by owner ID (UUID)
   *     responses:
   *       200:
   *         description: List of properties
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 properties:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Property'
   */
  async getAll(req: Request, res: Response) {
    try {
      const { ownerId } = req.query;

      let properties;
      if (ownerId) {
        properties = await this.service.getPropertiesByOwner(ownerId as string);
      } else {
        properties = await this.service.getAllProperties();
      }

      ResponseUtils.success(res, properties);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch properties');
    }
  }

  /**
   * @swagger
   * /api/properties/{id}:
   *   get:
   *     tags: ['Properties']
   *     summary: Get property by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Property details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Property'
   *       404:
   *         description: Property not found
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const propertyId = id;

      const property = await this.service.getPropertyById(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      ResponseUtils.success(res, property);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property');
    }
  }

  /**
   * @swagger
   * /api/properties:
   *   post:
   *     tags: ['Properties']
   *     summary: Create a new property
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PropertyInput'
   *     responses:
   *       201:
   *         description: Property created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Property'
   */
  async create(req: Request, res: Response) {
    try {
      const propertyData: PropertyInput = req.body;
      const property = await this.service.createProperty(propertyData);
      ResponseUtils.created(res, property, 'Property created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create property');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/{id}:
   *   put:
   *     tags: ['Properties']
   *     summary: Update property
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PropertyInput'
   *     responses:
   *       200:
   *         description: Property updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Property'
   *       404:
   *         description: Property not found
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const propertyId = id;
      const propertyData: Partial<PropertyInput> = req.body;

      const property = await this.service.updateProperty(propertyId, propertyData);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      ResponseUtils.success(res, property, 'Property updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      const { id } = req.params;
      const propertyId = id;
      logger.error('Property update error', err, { errorMessage, propertyId });
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update property');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/{id}:
   *   delete:
   *     tags: ['Properties']
   *     summary: Delete property
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Property deleted
   *       404:
   *         description: Property not found
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const propertyId = id;

      const deleted = await this.service.deleteProperty(propertyId);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      ResponseUtils.success(res, null, 'Property deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete property');
    }
  }

  /**
   * @swagger
   * /api/properties/{id}/status:
   *   patch:
   *     tags: ['Properties']
   *     summary: Update property status
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [available, occupied, under_maintenance, vacant]
   *     responses:
   *       200:
   *         description: Property status updated
   *       404:
   *         description: Property not found
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const propertyId = id;
      const { status } = req.body;

      if (!status) {
        return ResponseUtils.badRequest(res, 'Status is required');
      }

      const updated = await this.service.updatePropertyStatus(propertyId, status);
      if (!updated) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      ResponseUtils.success(res, null, 'Property status updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update property status');
      }
    }
  }

  /**
   * @swagger
   * /api/properties/{id}/template:
   *   get:
   *     tags: ['Property Templates']
   *     summary: Get property template settings
   *     parameters:
   *       - in: path
   *         name: id
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
   *               type: object
   *               properties:
   *                 templateId:
   *                   type: string
   *                   description: Template ID assigned to property
   *                 templateOverrides:
   *                   $ref: '#/components/schemas/ReceiptTemplateSettings'
   *                   description: Property-specific template overrides
   *                 effectiveSettings:
   *                   $ref: '#/components/schemas/ReceiptTemplateSettings'
   *                   description: Merged template settings (base + overrides)
   *       404:
   *         description: Property not found
   */
  async getPropertyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const propertyId = id;

      const property = await this.service.getPropertyById(propertyId);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      // Get effective template settings (merged base + overrides)
      const effectiveSettings = await this.service.getPropertyTemplateSettings(propertyId);

      ResponseUtils.success(res, {
        templateId: property.templateId,
        templateOverrides: property.templateOverrides,
        effectiveSettings
      });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property template');
    }
  }

  /**
   * @swagger
   * /api/properties/{id}/template:
   *   put:
   *     tags: ['Property Templates']
   *     summary: Set property template
   *     parameters:
   *       - in: path
   *         name: id
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
   *       404:
   *         description: Property or template not found
   */
  async setPropertyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const propertyId = id;
      const { templateId, overrides } = req.body;

      if (!templateId) {
        return ResponseUtils.badRequest(res, 'Template ID is required');
      }

      const success = await this.service.setPropertyTemplate(propertyId, templateId, overrides);
      if (!success) {
        return ResponseUtils.notFound(res, 'Property or template not found');
      }

      ResponseUtils.success(res, null, 'Property template set successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to set property template');
    }
  }

  /**
   * @swagger
   * /api/properties/{id}/template:
   *   delete:
   *     tags: ['Property Templates']
   *     summary: Remove property template (use default)
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       200:
   *         description: Property template removed successfully
   *       404:
   *         description: Property not found
   */
  async removePropertyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const propertyId = id;

      const success = await this.service.removePropertyTemplate(propertyId);
      if (!success) {
        return ResponseUtils.notFound(res, 'Property not found');
      }

      ResponseUtils.success(res, null, 'Property template removed successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to remove property template');
    }
  }
}