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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/index.get.ts
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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/id.get.ts
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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/index.post.ts
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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/id.put.ts
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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/id.delete.ts
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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/id.toggle.patch.ts
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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/id.charges.get.ts
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
   * OpenAPI moved to: /src/shared/config/swagger/apis/unit-utilities/paths/id.summary.get.ts
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