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
   * @swagger
   * /units:
   *   get:
   *     summary: Get all units
   *     tags: [Units]
   *     parameters:
   *       - in: query
   *         name: propertyId
   *         schema:
   *           type: string
   *         description: Filter by Property ID
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *         description: Filter by status
   *     responses:
   *       200:
   *         description: List of units
   *       500:
   *         description: Internal server error
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
   * @swagger
   * /units/{id}:
   *   get:
   *     summary: Get a unit by ID
   *     tags: [Units]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     responses:
   *       200:
   *         description: Unit details
   *       404:
   *         description: Unit not found
   *       500:
   *         description: Internal server error
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
   * @swagger
   * /units:
   *   post:
   *     summary: Create a new unit
   *     tags: [Units]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - propertyId
   *               - unitNumber
   *             properties:
   *               propertyId:
   *                 type: string
   *               unitNumber:
   *                 type: string
   *               type:
   *                 type: string
   *               rentAmount:
   *                 type: number
   *               status:
   *                 type: string
   *     responses:
   *       201:
   *         description: Unit created successfully
   *       500:
   *         description: Internal server error
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
   * @swagger
   * /units/{id}:
   *   put:
   *     summary: Update a unit
   *     tags: [Units]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               unitNumber:
   *                 type: string
   *               type:
   *                 type: string
   *               rentAmount:
   *                 type: number
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Unit updated successfully
   *       500:
   *         description: Internal server error
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
   * @swagger
   * /units/{id}:
   *   delete:
   *     summary: Delete a unit
   *     tags: [Units]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     responses:
   *       200:
   *         description: Unit deleted successfully
   *       500:
   *         description: Internal server error
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
   * @swagger
   * /units/{id}/status:
   *   patch:
   *     summary: Update unit status
   *     tags: [Units]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *     responses:
   *       200:
   *         description: Unit status updated successfully
   *       500:
   *         description: Internal server error
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
   * @swagger
   * /units/{id}/analytics:
   *   get:
   *     summary: Get unit analytics
   *     tags: [Units]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Unit ID
   *     responses:
   *       200:
   *         description: Unit analytics
   *       500:
   *         description: Internal server error
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
