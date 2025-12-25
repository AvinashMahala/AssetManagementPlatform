import { Request, Response } from 'express';
import { GetUnitsUseCase } from '../core/use-cases/GetUnits.usecase.js';
import { GetUnitByIdUseCase } from '../core/use-cases/GetUnitById.usecase.js';
import { CreateUnitUseCase } from '../core/use-cases/CreateUnit.usecase.js';
import { UpdateUnitUseCase } from '../core/use-cases/UpdateUnit.usecase.js';
import { DeleteUnitUseCase } from '../core/use-cases/DeleteUnit.usecase.js';
import { GetUnitAnalyticsUseCase } from '../core/use-cases/GetUnitAnalytics.usecase.js';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

/**
 * @swagger
 * tags:
 *   name: Units
 *   description: Unit management endpoints
 */
export class UnitController {
  constructor(
    private getUnitsUseCase: GetUnitsUseCase,
    private getUnitByIdUseCase: GetUnitByIdUseCase,
    private createUnitUseCase: CreateUnitUseCase,
    private updateUnitUseCase: UpdateUnitUseCase,
    private deleteUnitUseCase: DeleteUnitUseCase,
    private getUnitAnalyticsUseCase: GetUnitAnalyticsUseCase
  ) {}

  /**
   * OpenAPI moved to /src/shared/config/swagger/apis/units/paths/index.get.ts
   */
  async getAll(req: Request, res: Response) {
    try {
      const { propertyId, status } = req.query;
      const units = await this.getUnitsUseCase.execute({ 
        propertyId: propertyId as string, 
        status: status as string 
      });
      ResponseUtils.success(res, units);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch units');
    }
  }

  /**
   * OpenAPI moved to /src/shared/config/swagger/apis/units/paths/id.get.ts
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unit = await this.getUnitByIdUseCase.execute(id);
      if (!unit) {
        return ResponseUtils.notFound(res, 'Unit not found');
      }
      ResponseUtils.success(res, unit);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit');
    }
  }

  /**
   * OpenAPI moved to /src/shared/config/swagger/apis/units/paths/index.post.ts
   */
  async create(req: Request, res: Response) {
    try {
      const unit = await this.createUnitUseCase.execute(req.body);
      ResponseUtils.created(res, unit);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to create unit');
    }
  }

  /**
   * OpenAPI moved to /src/shared/config/swagger/apis/units/paths/id.put.ts
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unit = await this.updateUnitUseCase.execute({ id, data: req.body });
      ResponseUtils.success(res, unit);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update unit');
    }
  }

  /**
   * OpenAPI moved to /src/shared/config/swagger/apis/units/paths/id.delete.ts
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.deleteUnitUseCase.execute(id);
      ResponseUtils.success(res, { message: 'Unit deleted successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete unit');
    }
  }

  /**
   * OpenAPI moved to /src/shared/config/swagger/apis/units/paths/id.status.patch.ts
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const unit = await this.updateUnitUseCase.execute({ id, data: { status } });
      ResponseUtils.success(res, unit);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update unit status');
    }
  }

  /**
   * OpenAPI moved to /src/shared/config/swagger/apis/units/paths/id.analytics.get.ts
   */
  async getAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const analytics = await this.getUnitAnalyticsUseCase.execute(id);
      ResponseUtils.success(res, analytics);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit analytics');
    }
  }
}
