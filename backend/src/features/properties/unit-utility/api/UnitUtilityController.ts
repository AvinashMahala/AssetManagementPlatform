import { Request, Response } from 'express';
import { IUnitUtilityService } from '@/features/properties/unit-utility/core/interfaces/IUnitUtilityService.js';
import { UnitUtilityInput } from '@/features/properties/unit/core/types/unit.types';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

export class UnitUtilityController {
  private service: IUnitUtilityService;

  constructor(service: IUnitUtilityService) {
    this.service = service;
  }

  /**
   * @swagger
   * /api/unit-utilities:
   *   get:
   *     tags: ['Unit Utilities']
   *     summary: Get all unit utilities
   *     parameters:
   *       - in: query
   *         name: unitId
   *         schema:
   *           type: string
   *         description: Filter utilities by unit ID (UUID)
   *       - in: query
   *         name: propertyId
   *         schema:
   *           type: string
   *         description: Filter utilities by property ID (UUID)
   *     responses:
   *       200:
   *         description: List of unit utilities
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 utilities:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/UnitUtility'
   */
  async getAll(req: Request, res: Response) {
    try {
      const { unitId, propertyId } = req.query;

      let utilities;
      if (unitId) {
        utilities = await this.service.getUnitUtilitiesByUnit(unitId as string);
      } else if (propertyId) {
        utilities = await this.service.getUnitUtilitiesByProperty(propertyId as string);
      } else {
        utilities = await this.service.getAllUnitUtilities();
      }

      ResponseUtils.success(res, utilities);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit utilities');
    }
  }

  /**
   * @swagger
   * /api/unit-utilities/{id}:
   *   get:
   *     tags: ['Unit Utilities']
   *     summary: Get unit utility by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Unit utility details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnitUtility'
   *       404:
   *         description: Unit utility not found
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const utilityId = id;

      const utility = await this.service.getUnitUtilityById(utilityId);
      if (!utility) {
        return ResponseUtils.notFound(res, 'Unit utility not found');
      }

      ResponseUtils.success(res, utility);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit utility');
    }
  }

  /**
   * @swagger
   * /api/unit-utilities:
   *   post:
   *     tags: ['Unit Utilities']
   *     summary: Create a new unit utility
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UnitUtilityInput'
   *     responses:
   *       201:
   *         description: Unit utility created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnitUtility'
   */
  async create(req: Request, res: Response) {
    try {
      const utilityData: UnitUtilityInput = req.body;
      const utility = await this.service.createUnitUtility(utilityData);
      ResponseUtils.created(res, utility, 'Unit utility created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be') ||
          errorMessage.includes('not found')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create unit utility');
      }
    }
  }

  /**
   * @swagger
   * /api/unit-utilities/{id}:
   *   put:
   *     tags: ['Unit Utilities']
   *     summary: Update unit utility
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
   *             $ref: '#/components/schemas/UnitUtilityInput'
   *     responses:
   *       200:
   *         description: Unit utility updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UnitUtility'
   *       404:
   *         description: Unit utility not found
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const utilityId = id;
      const utilityData: Partial<UnitUtilityInput> = req.body;

      const utility = await this.service.updateUnitUtility(utilityId, utilityData);
      if (!utility) {
        return ResponseUtils.notFound(res, 'Unit utility not found');
      }

      ResponseUtils.success(res, utility, 'Unit utility updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be') ||
          errorMessage.includes('not found')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update unit utility');
      }
    }
  }

  /**
   * @swagger
   * /api/unit-utilities/{id}:
   *   delete:
   *     tags: ['Unit Utilities']
   *     summary: Delete unit utility
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Unit utility deleted
   *       404:
   *         description: Unit utility not found
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const utilityId = id;

      const deleted = await this.service.deleteUnitUtility(utilityId);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Unit utility not found');
      }

      ResponseUtils.success(res, null, 'Unit utility deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete unit utility');
    }
  }

  /**
   * @swagger
   * /api/unit-utilities/{id}/toggle:
   *   patch:
   *     tags: ['Unit Utilities']
   *     summary: Toggle unit utility status (enable/disable)
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
   *               isEnabled:
   *                 type: boolean
   *                 description: Whether to enable or disable the utility
   *     responses:
   *       200:
   *         description: Unit utility status updated
   *       404:
   *         description: Unit utility not found
   */
  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const utilityId = id;
      const { isEnabled } = req.body;

      if (isEnabled === undefined) {
        return ResponseUtils.badRequest(res, 'isEnabled field is required');
      }

      const updated = await this.service.toggleUnitUtility(utilityId, isEnabled);
      if (!updated) {
        return ResponseUtils.notFound(res, 'Unit utility not found');
      }

      ResponseUtils.success(res, null, `Unit utility ${isEnabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update unit utility status');
    }
  }

  /**
   * @swagger
   * /api/unit-utilities/{unitId}/charges:
   *   get:
   *     tags: ['Unit Utilities']
   *     summary: Calculate utility charges for a unit
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date
   *         description: Start date for charge calculation (ISO format)
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date
   *         description: End date for charge calculation (ISO format)
   *     responses:
   *       200:
   *         description: Utility charges calculation
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 unitId:
   *                   type: string
   *                 period:
   *                   type: object
   *                   properties:
   *                     startDate:
   *                       type: string
   *                       format: date-time
   *                     endDate:
   *                       type: string
   *                       format: date-time
   *                 utilities:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       utilityId:
   *                         type: string
   *                       utilityName:
   *                         type: string
   *                       utilityType:
   *                         type: string
   *                       billingMethod:
   *                         type: string
   *                       amount:
   *                         type: number
   *                 totalAmount:
   *                   type: number
   */
  async calculateCharges(req: Request, res: Response) {
    try {
      const { unitId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return ResponseUtils.badRequest(res, 'startDate and endDate are required');
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return ResponseUtils.badRequest(res, 'Invalid date format');
      }

      if (start >= end) {
        return ResponseUtils.badRequest(res, 'startDate must be before endDate');
      }

      const charges = await this.service.calculateUtilityCharges(unitId, start, end);
      ResponseUtils.success(res, charges);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to calculate utility charges');
      }
    }
  }

  /**
   * @swagger
   * /api/unit-utilities/{unitId}/summary:
   *   get:
   *     tags: ['Unit Utilities']
   *     summary: Get utility summary for a unit
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Utility summary for the unit
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 unitId:
   *                   type: string
   *                 totalUtilities:
   *                   type: integer
   *                 enabledUtilities:
   *                   type: integer
   *                 disabledUtilities:
   *                   type: integer
   *                 byType:
   *                   type: object
   *                   additionalProperties:
   *                     type: integer
   *                 byBillingMethod:
   *                   type: object
   *                   properties:
   *                     fixed:
   *                       type: integer
   *                     meter_based:
   *                       type: integer
   *                 utilities:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                       name:
   *                         type: string
   *                       type:
   *                         type: string
   *                       billingMethod:
   *                         type: string
   *                       isEnabled:
   *                         type: boolean
   *                       hasMeter:
   *                         type: boolean
   */
  async getSummary(req: Request, res: Response) {
    try {
      const { unitId } = req.params;

      const summary = await this.service.getUtilitySummary(unitId);
      ResponseUtils.success(res, summary);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to fetch utility summary');
      }
    }
  }

  /**
   * @swagger
   * /api/unit-utilities/{unitId}/validate:
   *   get:
   *     tags: ['Unit Utilities']
   *     summary: Validate utility configuration for a unit
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Validation result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 isValid:
   *                   type: boolean
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: string
   */
  async validateConfiguration(req: Request, res: Response) {
    try {
      const { unitId } = req.params;

      const validation = await this.service.validateUtilityConfiguration(unitId);
      ResponseUtils.success(res, validation);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to validate utility configuration');
      }
    }
  }
}