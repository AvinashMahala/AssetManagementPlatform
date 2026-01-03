import { Request, Response } from 'express';
import { IUnitTenantService } from '../core/interfaces/IUnitTenantService';
import { ResponseUtils } from '@/shared/utils/response.js';
import { ErrorUtils } from '@/shared/utils/error.js';
import { ZodError, ZodIssue } from 'zod';
import {
  assignTenantSchema,
  updateAssignmentSchema,
  queryAssignmentsSchema,
} from './unit-tenant.schema.validator';

/**
 * UnitTenantController
 *
 * Handles operations for assignments between units and tenants. Each method
 * uses ResponseUtils for consistent responses and ErrorUtils for error
 * handling.
 */
export class UnitTenantController {
  constructor(private readonly unitTenantService: IUnitTenantService) {}

  /**
   * Get tenants for a specific unit
   *
   * Route: GET /units/:id/tenants (or via unit-specific module)
   * Params: id (unit id)
   * Success: 200 with tenant list
   */
  async getTenants(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params; // unitId
      const tenants = await this.unitTenantService.findUnitTenants(id);
      ResponseUtils.success(res, tenants);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit tenants');
    }
  }

  /**
   * Get all unit-tenant assignments, or filter by query params
   *
   * Route: GET / (query: unitId, tenantId)
   * Success: 200 with assignments list
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const parsed = queryAssignmentsSchema.parse(req.query);
      const { unitId, tenantId } = parsed;
      let assignments;
      if (unitId) assignments = await this.unitTenantService.findUnitTenants(unitId as string);
      else if (tenantId) assignments = await this.unitTenantService.findByTenant(tenantId as string);
      else assignments = await this.unitTenantService.findAll();
      ResponseUtils.success(res, { assignments });
    } catch (err) {
      if (err instanceof ZodError)
        return ErrorUtils.handleValidationError(res, (err as ZodError<any>).issues.map((e: ZodIssue) => e.message).join('; '));
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit-tenant assignments');
    }
  }

  /**
   * Get a specific assignment by id
   *
   * Route: GET /:id
   * Success: 200 with assignment or 404 if not found
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const assignment = await this.unitTenantService.findById(id);
      if (!assignment) {
        return ResponseUtils.notFound(res, 'Unit-tenant assignment not found');
      }
      ResponseUtils.success(res, assignment);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch assignment');
    }
  }

  /**
   * Assign a tenant to a unit
   *
   * Route: POST /
   * Body: { unitId, tenantId, ... }
   * Success: 201 with created assignment
   */
  async assignTenant(req: Request, res: Response): Promise<void> {
    try {
      const unitId = req.params.unitId || req.body.unitId;
      const assignmentData = { ...req.body, unitId };
      const validated = assignTenantSchema.parse(assignmentData);
      const assignment = await this.unitTenantService.assignTenantToUnit(validated as any);
      ResponseUtils.created(res, assignment);
    } catch (err) {
      if (err instanceof ZodError)
        return ErrorUtils.handleValidationError(res, (err as ZodError<any>).issues.map((e: ZodIssue) => e.message).join('; '));
      ErrorUtils.handleGenericError(res, err, 'Failed to assign tenant to unit');
    }
  }

  /**
   * Update a tenant assignment
   *
   * Route: PUT /:unitId/:tenantId
   * Success: 200 with updated assignment or 404 if not found
   */
  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { unitId, tenantId } = req.params;
      const updates = updateAssignmentSchema.parse(req.body) as Partial<any>;
      const assignment = await this.unitTenantService.updateTenantAssignment(unitId, tenantId, updates);
      if (!assignment) {
        return ResponseUtils.notFound(res, 'Tenant assignment not found');
      }
      ResponseUtils.success(res, assignment);
    } catch (err) {
      if (err instanceof ZodError)
        return ErrorUtils.handleValidationError(res, (err as ZodError<any>).issues.map((e: ZodIssue) => e.message).join('; '));
      ErrorUtils.handleGenericError(res, err, 'Failed to update tenant assignment');
    }
  }

  /**
   * Remove a tenant from a unit
   *
   * Route: DELETE /:unitId/:tenantId
   * Success: 200 with confirmation or 404 if not found
   */
  async removeTenant(req: Request, res: Response): Promise<void> {
    try {
      const { unitId, tenantId } = req.params;
      const removed = await this.unitTenantService.removeTenantFromUnit(unitId, tenantId);
      if (!removed) {
        return ResponseUtils.notFound(res, 'Tenant assignment not found');
      }
      ResponseUtils.success(res, { message: 'Tenant removed from unit successfully' });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to remove tenant from unit');
    }
  }
}
