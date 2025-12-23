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

  /**
   * @swagger
   * /units/{id}/tenants:
   *   get:
   *     summary: Get tenants for a unit
   *     tags: [Unit Tenants]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     responses:
   *       200:
   *         description: List of tenants in the unit
   *       500:
   *         description: Internal server error
   */
  async getTenants(req: Request, res: Response) {
    try {
      const { id } = req.params; // unitId
      const tenants = await this.getUnitTenantsUseCase.execute(id);
      ResponseUtils.success(res, tenants);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit tenants');
    }
  }

  /**
   * @swagger
   * /unit-tenants:
   *   get:
   *     summary: List all unit-tenant assignments
   *     tags: [Unit Tenants]
   *     parameters:
   *       - in: query
   *         name: unitId
   *         schema:
   *           type: string
   *         description: Filter by Unit ID
   *       - in: query
   *         name: tenantId
   *         schema:
   *           type: string
   *         description: Filter by Tenant ID
   *     responses:
   *       200:
   *         description: List of assignments
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /unit-tenants/{id}:
   *   get:
   *     summary: Get unit-tenant assignment by ID
   *     tags: [Unit Tenants]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Assignment ID
   *     responses:
   *       200:
   *         description: Assignment details
   *       404:
   *         description: Assignment not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /unit-tenants:
   *   post:
   *     summary: Assign a tenant to a unit
   *     tags: [Unit Tenants]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - unitId
   *               - tenantId
   *               - startDate
   *             properties:
   *               unitId:
   *                 type: string
   *               tenantId:
   *                 type: string
   *               startDate:
   *                 type: string
   *                 format: date
   *               endDate:
   *                 type: string
   *                 format: date
   *               status:
   *                 type: string
   *                 enum: [active, inactive]
   *     responses:
   *       201:
   *         description: Tenant assigned successfully
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /units/{unitId}/tenants/{tenantId}:
   *   put:
   *     summary: Update tenant assignment
   *     tags: [Unit Tenants]
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Tenant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               startDate:
   *                 type: string
   *                 format: date
   *               endDate:
   *                 type: string
   *                 format: date
   *               status:
   *                 type: string
   *                 enum: [active, inactive]
   *     responses:
   *       200:
   *         description: Assignment updated successfully
   *       404:
   *         description: Assignment not found
   *       500:
   *         description: Internal server error
   */
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

  /**
   * @swagger
   * /units/{unitId}/tenants/{tenantId}:
   *   delete:
   *     summary: Remove tenant from unit
   *     tags: [Unit Tenants]
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Tenant ID
   *     responses:
   *       200:
   *         description: Tenant removed successfully
   *       404:
   *         description: Assignment not found
   *       500:
   *         description: Internal server error
   */
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
