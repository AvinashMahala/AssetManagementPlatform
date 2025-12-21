import { Request, Response } from 'express';
import { GetUnitTenantsUseCase } from '../core/use-cases/GetUnitTenants.usecase.js';
import { GetUnitTenantsQueryUseCase } from '../core/use-cases/GetUnitTenantsQuery.usecase.js';
import { GetUnitTenantByIdUseCase } from '../core/use-cases/GetUnitTenantById.usecase.js';
import { AssignTenantToUnitUseCase } from '../core/use-cases/AssignTenantToUnit.usecase.js';
import { UpdateTenantAssignmentUseCase } from '../core/use-cases/UpdateTenantAssignment.usecase.js';
import { RemoveTenantFromUnitUseCase } from '../core/use-cases/RemoveTenantFromUnit.usecase.js';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';

export class UnitTenantController {
  constructor(
    private getUnitTenantsUseCase: GetUnitTenantsUseCase,
    private getUnitTenantsQueryUseCase: GetUnitTenantsQueryUseCase,
    private getUnitTenantByIdUseCase: GetUnitTenantByIdUseCase,
    private assignTenantToUnitUseCase: AssignTenantToUnitUseCase,
    private updateTenantAssignmentUseCase: UpdateTenantAssignmentUseCase,
    private removeTenantFromUnitUseCase: RemoveTenantFromUnitUseCase
  ) {}

  async getTenants(req: Request, res: Response) {
    try {
      const { id } = req.params; // unitId
      const tenants = await this.getUnitTenantsUseCase.execute(id);
      ResponseUtils.success(res, tenants);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit tenants');
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { unitId, tenantId } = req.query;
      const assignments = await this.getUnitTenantsQueryUseCase.execute({ 
        unitId: unitId as string, 
        tenantId: tenantId as string 
      });
      ResponseUtils.success(res, { assignments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit-tenant assignments');
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignment = await this.getUnitTenantByIdUseCase.execute(id);
      if (!assignment) {
        return ResponseUtils.notFound(res, 'Unit-tenant assignment not found');
      }
      ResponseUtils.success(res, assignment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch assignment');
    }
  }

  async assignTenant(req: Request, res: Response) {
    try {
      const unitId = req.params.unitId || req.body.unitId;
      if (!unitId) {
        return ResponseUtils.badRequest(res, 'Unit ID is required');
      }
      const assignmentData = { ...req.body, unitId };
      const assignment = await this.assignTenantToUnitUseCase.execute(assignmentData);
      ResponseUtils.created(res, assignment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to assign tenant to unit');
    }
  }

  async updateAssignment(req: Request, res: Response) {
    try {
      const { unitId, tenantId } = req.params;
      const updates = req.body;
      const assignment = await this.updateTenantAssignmentUseCase.execute(unitId, tenantId, updates);
      if (!assignment) {
        return ResponseUtils.notFound(res, 'Tenant assignment not found');
      }
      ResponseUtils.success(res, assignment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to update tenant assignment');
    }
  }

  async removeTenant(req: Request, res: Response) {
    try {
      const { unitId, tenantId } = req.params;
      const removed = await this.removeTenantFromUnitUseCase.execute(unitId, tenantId);
      if (!removed) {
        return ResponseUtils.notFound(res, 'Tenant assignment not found');
      }
      ResponseUtils.success(res, { message: 'Tenant removed from unit successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to remove tenant from unit');
    }
  }
}
