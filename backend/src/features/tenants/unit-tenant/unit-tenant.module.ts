import { Pool } from 'pg';
import { UnitTenantRepository } from './repository/UnitTenantRepository.js';
import { UnitTenantService } from './core/services/UnitTenantService';
import { UnitTenantController } from './api/UnitTenantController.js';
import { createUnitTenantRoutes } from './api/unit-tenant.routes.js';

export class UnitTenantModule {
  static createController(pool: Pool): UnitTenantController {
    const repository = new UnitTenantRepository(pool);
    
    const service = new UnitTenantService(repository);

    return new UnitTenantController(service);
  }

  static create(pool: Pool, userService: any) {
    const controller = this.createController(pool);
    return createUnitTenantRoutes(controller, userService);
  }
}

