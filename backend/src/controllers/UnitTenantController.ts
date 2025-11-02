import { Request, Response } from 'express';
import { IUnitTenantService } from '../interfaces/services/IUnitTenantService.js';
import { UnitTenantInput } from '../models/Unit.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';

export class UnitTenantController {
  private service: IUnitTenantService;

  constructor(service: IUnitTenantService) {
    this.service = service;
  }

  /**
   * @swagger
   * /api/unit-tenants:
   *   get:
   *     tags: ['Unit Tenants']
   *     summary: Get all unit-tenant assignments
   *     parameters:
   *       - in: query
   *         name: unitId
   *         schema:
   *           type: string
   *         description: Filter by unit ID (UUID)
   *       - in: query
   *         name: tenantId
   *         schema:
   *           type: string
   *         description: Filter by tenant ID (UUID)
   *     responses:
   *       200:
   *         description: List of unit-tenant assignments
   */
  async getAll(req: Request, res: Response) {
    try {
      const { unitId, tenantId } = req.query;

      let assignments;
      if (unitId) {
        assignments = await this.service.getTenantsByUnit(unitId as string);
      } else if (tenantId) {
        assignments = await this.service.getUnitsByTenant(tenantId as string);
      } else {
        assignments = await this.service.getAllAssignments();
      }

      ResponseUtils.success(res, { assignments });
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit-tenant assignments');
    }
  }

  /**
   * @swagger
   * /api/unit-tenants/{id}:
   *   get:
   *     tags: ['Unit Tenants']
   *     summary: Get unit-tenant assignment by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Unit-tenant assignment details
   *       404:
   *         description: Assignment not found
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignmentId = id;

      const assignment = await this.service.getAssignmentById(assignmentId);
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
   * /api/unit-tenants:
   *   post:
   *     tags: ['Unit Tenants']
   *     summary: Assign tenant to unit
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UnitTenantInput'
   *     responses:
   *       201:
   *         description: Tenant assigned to unit
   */
  async assignTenant(req: Request, res: Response) {
    try {
      const assignmentData: UnitTenantInput = req.body;
      const assignment = await this.service.assignTenantToUnit(assignmentData);
      ResponseUtils.created(res, assignment, 'Tenant assigned to unit successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to assign tenant to unit');
      }
    }
  }

  /**
   * @swagger
   * /api/unit-tenants/{unitId}/{tenantId}:
   *   delete:
   *     tags: ['Unit Tenants']
   *     summary: Remove tenant from unit
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Tenant removed from unit
   *       404:
   *         description: Assignment not found
   */
  async removeTenant(req: Request, res: Response) {
    try {
      const { unitId, tenantId } = req.params;

      const removed = await this.service.removeTenantFromUnit(unitId, tenantId);
      if (!removed) {
        return ResponseUtils.notFound(res, 'Unit-tenant assignment not found');
      }

      ResponseUtils.success(res, null, 'Tenant removed from unit successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to remove tenant from unit');
    }
  }

  /**
   * @swagger
   * /api/unit-tenants/{unitId}/{tenantId}:
   *   put:
   *     tags: ['Unit Tenants']
   *     summary: Update tenant-unit assignment
   *     parameters:
   *       - in: path
   *         name: unitId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: tenantId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UnitTenantInput'
   *     responses:
   *       200:
   *         description: Assignment updated
   *       404:
   *         description: Assignment not found
   */
  async updateAssignment(req: Request, res: Response) {
    try {
      const { unitId, tenantId } = req.params;
      const updates: Partial<UnitTenantInput> = req.body;

      const assignment = await this.service.updateTenantAssignment(unitId, tenantId, updates);
      if (!assignment) {
        return ResponseUtils.notFound(res, 'Unit-tenant assignment not found');
      }

      ResponseUtils.success(res, assignment, 'Assignment updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update assignment');
      }
    }
  }
}