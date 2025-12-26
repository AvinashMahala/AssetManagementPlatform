import { Pool } from 'pg';
import { UnitTenantRepository } from './repository/UnitTenantRepository.js';
import { GetUnitTenantsUseCase } from './core/use-cases/GetUnitTenants.usecase.js';
import { GetUnitTenantsQueryUseCase } from './core/use-cases/GetUnitTenantsQuery.usecase.js';
import { GetUnitTenantByIdUseCase } from './core/use-cases/GetUnitTenantById.usecase.js';
import { AssignTenantToUnitUseCase } from './core/use-cases/AssignTenantToUnit.usecase.js';
import { UpdateTenantAssignmentUseCase } from './core/use-cases/UpdateTenantAssignment.usecase.js';
import { RemoveTenantFromUnitUseCase } from './core/use-cases/RemoveTenantFromUnit.usecase.js';
import { UnitTenantController } from './api/UnitTenantController.js';
import { createUnitTenantRoutes } from './api/unit-tenant.routes.js';

export class UnitTenantModule {
  static createController(pool: Pool): UnitTenantController {
    const repository = new UnitTenantRepository(pool);
    
    const getUnitTenantsUseCase = new GetUnitTenantsUseCase(repository);
    const getUnitTenantsQueryUseCase = new GetUnitTenantsQueryUseCase(repository);
    const getUnitTenantByIdUseCase = new GetUnitTenantByIdUseCase(repository);
    const assignTenantToUnitUseCase = new AssignTenantToUnitUseCase(repository);
    const updateTenantAssignmentUseCase = new UpdateTenantAssignmentUseCase(repository);
    const removeTenantFromUnitUseCase = new RemoveTenantFromUnitUseCase(repository);

    return new UnitTenantController(
      getUnitTenantsUseCase,
      getUnitTenantsQueryUseCase,
      getUnitTenantByIdUseCase,
      assignTenantToUnitUseCase,
      updateTenantAssignmentUseCase,
      removeTenantFromUnitUseCase
    );
  }

  static create(pool: Pool, userService: any) {
    const controller = this.createController(pool);
    return createUnitTenantRoutes(controller, userService);
  }
}

