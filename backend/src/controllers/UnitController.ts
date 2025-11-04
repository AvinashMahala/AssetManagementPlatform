import { Request, Response } from 'express';
import { IUnitService } from '../interfaces/services/IUnitService.js';
import { UnitInput } from '../models/Unit.js';
import { ResponseUtils } from '../utils/response.js';
import { ErrorUtils } from '../utils/error.js';

export class UnitController {
  private service: IUnitService;

  constructor(service: IUnitService) {
    this.service = service;
  }

  /**
   * @swagger
   * /api/units:
   *   get:
   *     tags: ['Units']
   *     summary: Get all units
   *     parameters:
   *       - in: query
   *         name: propertyId
   *         schema:
   *           type: string
   *         description: Filter units by property ID (UUID)
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filter units by status
   *     responses:
   *       200:
   *         description: List of units
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 units:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Unit'
   */
  async getAll(req: Request, res: Response) {
    try {
      const { propertyId, status } = req.query;

      let units;
      if (propertyId) {
        units = await this.service.getUnitsByProperty(propertyId as string);
      } else if (status) {
        units = await this.service.getUnitsByStatus(status as string);
      } else {
        units = await this.service.getAllUnits();
      }

      ResponseUtils.success(res, units);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch units');
    }
  }

  /**
   * @swagger
   * /api/units/{id}:
   *   get:
   *     tags: ['Units']
   *     summary: Get unit by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Unit details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Unit'
   *       404:
   *         description: Unit not found
   */
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unitId = id;

      const unit = await this.service.getUnitById(unitId);
      if (!unit) {
        return ResponseUtils.notFound(res, 'Unit not found');
      }

      ResponseUtils.success(res, unit);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit');
    }
  }

  /**
   * @swagger
   * /api/units:
   *   post:
   *     tags: ['Units']
   *     summary: Create a new unit
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UnitInput'
   *     responses:
   *       201:
   *         description: Unit created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Unit'
   */
  async create(req: Request, res: Response) {
    try {
      const unitData: UnitInput = req.body;
      const unit = await this.service.createUnit(unitData);
      ResponseUtils.created(res, unit, 'Unit created successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to create unit');
      }
    }
  }

  /**
   * @swagger
   * /api/units/{id}:
   *   put:
   *     tags: ['Units']
   *     summary: Update unit
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
   *             $ref: '#/components/schemas/UnitInput'
   *     responses:
   *       200:
   *         description: Unit updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Unit'
   *       404:
   *         description: Unit not found
   */
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unitId = id;
      const unitData: Partial<UnitInput> = req.body;

      const unit = await this.service.updateUnit(unitId, unitData);
      if (!unit) {
        return ResponseUtils.notFound(res, 'Unit not found');
      }

      ResponseUtils.success(res, unit, 'Unit updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update unit');
      }
    }
  }

  /**
   * @swagger
   * /api/units/{id}:
   *   delete:
   *     tags: ['Units']
   *     summary: Delete unit
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Unit deleted
   *       404:
   *         description: Unit not found
   */
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unitId = id;

      const deleted = await this.service.deleteUnit(unitId);
      if (!deleted) {
        return ResponseUtils.notFound(res, 'Unit not found');
      }

      ResponseUtils.success(res, null, 'Unit deleted successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to delete unit');
    }
  }

  /**
   * @swagger
   * /api/units/{id}/status:
   *   patch:
   *     tags: ['Units']
   *     summary: Update unit status
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
   *         description: Unit status updated
   *       404:
   *         description: Unit not found
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unitId = id;
      const { status } = req.body;

      if (!status) {
        return ResponseUtils.badRequest(res, 'Status is required');
      }

      const updated = await this.service.updateUnitStatus(unitId, status);
      if (!updated) {
        return ResponseUtils.notFound(res, 'Unit not found');
      }

      ResponseUtils.success(res, null, 'Unit status updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Invalid')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update unit status');
      }
    }
  }

  /**
   * @swagger
   * /api/units/{id}/tenants:
   *   get:
   *     tags: ['Units']
   *     summary: Get tenants for a unit
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of tenants for the unit
   */
  async getTenants(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unitId = id;

      const tenants = await this.service.getUnitTenants(unitId);
      ResponseUtils.success(res, tenants);
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to fetch unit tenants');
    }
  }

  /**
   * @swagger
   * /api/units/{unitId}/tenants:
   *   post:
   *     tags: ['Units']
   *     summary: Assign tenant to unit
   *     parameters:
   *       - in: path
   *         name: unitId
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
   *       201:
   *         description: Tenant assigned to unit
   */
  async assignTenant(req: Request, res: Response) {
    try {
      const { unitId } = req.params;
      const assignmentData = req.body;

      // Ensure unitId matches
      assignmentData.unitId = unitId;

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
   * /api/units/{unitId}/tenants/{tenantId}:
   *   put:
   *     tags: ['Units']
   *     summary: Update tenant assignment
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
   *             type: object
   *             properties:
   *               isPrimaryTenant:
   *                 type: boolean
   *               moveInDate:
   *                 type: string
   *                 format: date
   *               moveOutDate:
   *                 type: string
   *                 format: date
   *               monthlyRentShare:
   *                 type: number
   *               securityDepositShare:
   *                 type: number
   *               status:
   *                 type: string
   *                 enum: [active, inactive, evicted]
   *     responses:
   *       200:
   *         description: Tenant assignment updated
   *       404:
   *         description: Assignment not found
   */
  async updateTenantAssignment(req: Request, res: Response) {
    try {
      const { unitId, tenantId } = req.params;
      const updates = req.body;

      const assignment = await this.service.updateTenantAssignment(unitId, tenantId, updates);
      if (!assignment) {
        return ResponseUtils.notFound(res, 'Tenant assignment not found');
      }

      ResponseUtils.success(res, assignment, 'Tenant assignment updated successfully');
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('required') || errorMessage.includes('Invalid') ||
          errorMessage.includes('cannot be') || errorMessage.includes('must be')) {
        ResponseUtils.badRequest(res, errorMessage);
      } else {
        ErrorUtils.handleGenericError(res, err, 'Failed to update tenant assignment');
      }
    }
  }

  /**
   * @swagger
   * /api/units/{unitId}/tenants/{tenantId}:
   *   delete:
   *     tags: ['Units']
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
        return ResponseUtils.notFound(res, 'Tenant assignment not found');
      }

      ResponseUtils.success(res, null, 'Tenant removed from unit successfully');
    } catch (err) {
      ErrorUtils.handleGenericError(res, err, 'Failed to remove tenant from unit');
    }
  }
}