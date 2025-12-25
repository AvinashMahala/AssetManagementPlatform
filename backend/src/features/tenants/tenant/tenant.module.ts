import { Router } from 'express';
import { Pool } from 'pg';
import { TenantRepository } from './data/repository/TenantRepository';
import { CreateTenantUseCase } from './core/use-cases/CreateTenant.usecase';
import { UpdateTenantUseCase } from './core/use-cases/UpdateTenant.usecase';
import { GetTenantByIdUseCase } from './core/use-cases/GetTenantById.usecase';
import { ListTenantsUseCase } from './core/use-cases/ListTenants.usecase';
import { DeleteTenantUseCase } from './core/use-cases/DeleteTenant.usecase';
import { TenantController } from './api/TenantController';
import { createTenantRoutes } from './api/tenant.routes';
import { IUserService } from '@/features/auth/user/core/IUserService';

export class TenantModule {
  static create(pool: Pool, userService: IUserService): Router {
    const repository = new TenantRepository(pool);
    
    const createUseCase = new CreateTenantUseCase(repository);
    const updateUseCase = new UpdateTenantUseCase(repository);
    const getByIdUseCase = new GetTenantByIdUseCase(repository);
    const listUseCase = new ListTenantsUseCase(repository);
    const deleteUseCase = new DeleteTenantUseCase(repository);

    const controller = new TenantController(
      createUseCase,
      updateUseCase,
      getByIdUseCase,
      listUseCase,
      deleteUseCase
    );

    return createTenantRoutes(controller, userService);
  }
}
