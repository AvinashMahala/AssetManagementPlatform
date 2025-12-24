import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/shared/middleware/authMiddleware.js';
import { GetPropertiesUseCase } from '../core/use-cases/GetProperties.usecase.js';
import { GetPropertyByIdUseCase } from '../core/use-cases/GetPropertyById.usecase.js';
import { CreatePropertyUseCase } from '../core/use-cases/CreateProperty.usecase.js';
import { UpdatePropertyUseCase } from '../core/use-cases/UpdateProperty.usecase.js';
import { DeletePropertyUseCase } from '../core/use-cases/DeleteProperty.usecase.js';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';
import { PropertyInput } from '../core/types/property.types.js';
import { createModuleLogger } from '@/shared/utils/logger.js';

const logger = createModuleLogger('PropertyController');

export class PropertyController {
  constructor(
    private getPropertiesUseCase: GetPropertiesUseCase,
    private getPropertyByIdUseCase: GetPropertyByIdUseCase,
    private createPropertyUseCase: CreatePropertyUseCase,
    private updatePropertyUseCase: UpdatePropertyUseCase,
    private deletePropertyUseCase: DeletePropertyUseCase
  ) {}

  /**
   * @swagger
   * /properties:
   *   get:
   *     summary: Get all properties
   *     tags: [Properties]
   *     parameters:
   *       - in: query
   *         name: ownerId
   *         schema:
   *           type: string
   *         description: Filter by owner ID
   *     responses:
   *       200:
   *         description: List of properties
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Property'
   */
  async getAll(req: Request, res: Response) {
    try {
      const { ownerId } = req.query;
      const properties = await this.getPropertiesUseCase.execute({ ownerId: ownerId as string });
      ResponseUtils.success(res, properties);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch properties');
    }
  }

  /**
   * @swagger
   * /properties/{id}:
   *   get:
   *     summary: Get property by ID
   *     tags: [Properties]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
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
      const property = await this.getPropertyByIdUseCase.execute(id);
      ResponseUtils.success(res, property);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property');
    }
  }

  /**
   * @swagger
   * /properties:
   *   post:
   *     summary: Create a new property
   *     tags: [Properties]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PropertyInput'
   *     responses:
   *       201:
   *         description: Property created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Property'
   *       400:
   *         description: Invalid input
   */
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const propertyData: PropertyInput = req.body;
      // Debug: log incoming payload to help trace missing totalArea issues (temporary)
      logger.debug('Create property payload', { keys: Object.keys(req.body || {}), area: (req.body as any).area, totalArea: (req.body as any).totalArea });
      
      // Handle ownerId based on user role
      const authenticatedUser = req.user;
      if (authenticatedUser) {
        // If user is admin, allow them to set ownerId, otherwise use their own ID
        if (authenticatedUser.role !== 'admin' && propertyData.ownerId) {
          propertyData.ownerId = authenticatedUser.id;
        } else if (!propertyData.ownerId) {
          propertyData.ownerId = authenticatedUser.id;
        }
      }

      const property = await this.createPropertyUseCase.execute(propertyData);
      ResponseUtils.created(res, property);
    } catch (err) {
      const errorMessage = (err as Error).message;

      // Map backend validation errors to field-specific errors
      const fieldErrors: Record<string, string> = {};

      // Name validation errors
      if (errorMessage.includes('Property name is required')) {
        fieldErrors.name = 'Property name is required';
      } else if (errorMessage.includes('Property name must be less than')) {
        fieldErrors.name = 'Property name is too long (max 255 characters)';
      }

      // Description validation errors
      if (errorMessage.includes('Property description must be less than')) {
        fieldErrors.description = 'Description is too long (max 1000 characters)';
      }

      // Property type validation
      if (errorMessage.includes('Invalid property type')) {
        fieldErrors.propertyType = 'Please select a valid property type';
      }

      // Status validation
      if (errorMessage.includes('Invalid property status')) {
        fieldErrors.status = 'Please select a valid property status';
      }

      // Area validation
      if (errorMessage.includes('Property area is required')) {
        fieldErrors.totalArea = 'Property area is required';
      } else if (errorMessage.includes('Property area must be between')) {
        fieldErrors.totalArea = 'Property area must be between 1 and 100,000 sq ft';
      }

      // Address validation errors
      if (errorMessage.includes('Street address is required')) {
        fieldErrors['address.street'] = 'Street address is required';
      } else if (errorMessage.includes('Street address must be less than')) {
        fieldErrors['address.street'] = 'Street address is too long (max 255 characters)';
      }

      if (errorMessage.includes('City is required')) {
        fieldErrors['address.city'] = 'City is required';
      } else if (errorMessage.includes('City must be less than')) {
        fieldErrors['address.city'] = 'City is too long (max 100 characters)';
      }

      if (errorMessage.includes('State is required')) {
        fieldErrors['address.state'] = 'State is required';
      } else if (errorMessage.includes('State must be less than')) {
        fieldErrors['address.state'] = 'State is too long (max 100 characters)';
      }

      if (errorMessage.includes('Pincode must be a valid')) {
        fieldErrors['address.pincode'] = 'Pincode must be a valid 5 or 6-digit number';
      }

      // Owner validation
      if (errorMessage.includes('Property owner is required')) {
        fieldErrors.ownerId = 'Property owner is required';
      }

      // Amenities validation
      if (errorMessage.includes('Too many amenities')) {
        fieldErrors.buildingAmenities = 'Too many amenities selected (max 50)';
      }

      // Photos validation
      if (errorMessage.includes('Too many photos')) {
        fieldErrors.buildingPhotos = 'Too many photos selected (max 20)';
      }

      // If we have field-specific errors, return them
      if (Object.keys(fieldErrors).length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: fieldErrors
          }
        });
      }

      // Fallback for other validation errors
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
   * /properties/{id}:
   *   put:
   *     summary: Update a property
   *     tags: [Properties]
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
   *             $ref: '#/components/schemas/PropertyInput'
   *     responses:
   *       200:
   *         description: Property updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Property'
   *       404:
   *         description: Property not found
   *       400:
   *         description: Invalid input
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await this.updatePropertyUseCase.execute({ id, data: req.body });
      ResponseUtils.success(res, property);
    } catch (err) {
      const errorMessage = (err as Error).message;
      const { id } = req.params;
      logger.error('Property update error', err, { errorMessage, propertyId: id });
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
   * /properties/{id}:
   *   delete:
   *     summary: Delete a property
   *     tags: [Properties]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Property ID
   *     responses:
   *       204:
   *         description: Property deleted successfully
   *       404:
   *         description: Property not found
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.deletePropertyUseCase.execute(id);
      res.status(204).send();
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete property');
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const property = await this.updatePropertyUseCase.execute({ id, data: { status } });
      ResponseUtils.success(res, property);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update property status');
    }
  }

  async getPropertyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await this.getPropertyByIdUseCase.execute(id);
      if (!property) {
        return ResponseUtils.notFound(res, 'Property not found');
      }
      
      // Note: effectiveSettings logic was removed as it's not used in frontend
      ResponseUtils.success(res, {
        templateId: property.templateId,
        templateOverrides: property.templateOverrides
      });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch property template');
    }
  }

  async setPropertyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { templateId, templateOverrides } = req.body;
      const property = await this.updatePropertyUseCase.execute({ 
        id, 
        data: { templateId, templateOverrides } 
      });
      ResponseUtils.success(res, property);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to set property template');
    }
  }

  async removePropertyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const property = await this.updatePropertyUseCase.execute({ 
        id, 
        data: { templateId: null as any, templateOverrides: null as any } 
      });
      ResponseUtils.success(res, property);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to remove property template');
    }
  }
}
