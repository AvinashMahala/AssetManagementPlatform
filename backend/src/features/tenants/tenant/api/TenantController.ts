import { Request, Response, NextFunction } from 'express';
import { CreateTenantUseCase } from '../core/use-cases/CreateTenant.usecase';
import { UpdateTenantUseCase } from '../core/use-cases/UpdateTenant.usecase';
import { GetTenantByIdUseCase } from '../core/use-cases/GetTenantById.usecase';
import { ListTenantsUseCase } from '../core/use-cases/ListTenants.usecase';
import { DeleteTenantUseCase } from '../core/use-cases/DeleteTenant.usecase';
import { createTenantSchema, updateTenantSchema } from './validation/tenant.schema';

import { logger } from '@/shared/utils/logger';

export class TenantController {
  constructor(
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly updateTenantUseCase: UpdateTenantUseCase,
    private readonly getTenantByIdUseCase: GetTenantByIdUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly deleteTenantUseCase: DeleteTenantUseCase
  ) {}

  /**
   * @swagger
   * /tenants:
   *   post:
   *     summary: Create a new tenant
   *     tags: [Tenants]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TenantInput'
   *     responses:
   *       201:
   *         description: Tenant created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tenant'
   */
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createTenantSchema.parse(req.body);
      const tenant = await this.createTenantUseCase.execute(validatedData);
      res.status(201).json(tenant);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tenants/{id}:
   *   put:
   *     summary: Update a tenant
   *     tags: [Tenants]
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
   *             $ref: '#/components/schemas/TenantInput'
   *     responses:
   *       200:
   *         description: Tenant updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tenant'
   */
  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validatedData = updateTenantSchema.parse(req.body);
      const tenant = await this.updateTenantUseCase.execute({ id, data: validatedData });
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tenants/{id}:
   *   get:
   *     summary: Get tenant by ID
   *     tags: [Tenants]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Tenant details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Tenant'
   */
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenant = await this.getTenantByIdUseCase.execute(id);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @swagger
   * /tenants:
   *   get:
   *     summary: List all tenants
   *     tags: [Tenants]
   *     responses:
   *       200:
   *         description: List of tenants
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Tenant'
   */
  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('TenantController.list: Fetching all tenants');
      const tenants = await this.listTenantsUseCase.execute();
      logger.info(`TenantController.list: Found ${tenants.length} tenants`);
      res.json(tenants);
    } catch (error) {
      logger.error('TenantController.list: Error fetching tenants', { error });
      next(error);
    }
  };

  /**
   * @swagger
   * /tenants/{id}:
   *   delete:
   *     summary: Delete a tenant
   *     tags: [Tenants]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Tenant deleted successfully
   */
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.deleteTenantUseCase.execute(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
