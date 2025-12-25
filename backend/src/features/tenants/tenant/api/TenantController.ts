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

  // Swagger moved to `src/shared/config/swagger/apis/tenants/paths/tenant/index.post.ts`
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createTenantSchema.parse(req.body);
      const tenant = await this.createTenantUseCase.execute(validatedData);
      res.status(201).json(tenant);
    } catch (error) {
      next(error);
    }
  };

  // Swagger moved to `src/shared/config/swagger/apis/tenants/paths/tenant/id.put.ts`
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

  // Swagger moved to `src/shared/config/swagger/apis/tenants/paths/tenant/id.get.ts`
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenant = await this.getTenantByIdUseCase.execute(id);
      res.json(tenant);
    } catch (error) {
      next(error);
    }
  };

  // Swagger moved to `src/shared/config/swagger/apis/tenants/paths/tenant/index.get.ts`
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

  // Swagger moved to `src/shared/config/swagger/apis/tenants/paths/tenant/id.delete.ts`
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
