import { Pool } from 'pg';
import { UnitRepository } from './data/repository/UnitRepository.js';
import { GetUnitsUseCase } from './core/use-cases/GetUnits.usecase.js';
import { GetUnitByIdUseCase } from './core/use-cases/GetUnitById.usecase.js';
import { CreateUnitUseCase } from './core/use-cases/CreateUnit.usecase.js';
import { UpdateUnitUseCase } from './core/use-cases/UpdateUnit.usecase.js';
import { DeleteUnitUseCase } from './core/use-cases/DeleteUnit.usecase.js';
import { UnitController } from './api/UnitController.js';
import { createUnitRoutes } from './api/unit.routes.js';

export class UnitModule {
  static create(pool: Pool, userService: any) {
    const repository = new UnitRepository(pool);
    
    const getUnitsUseCase = new GetUnitsUseCase(repository);
    const getUnitByIdUseCase = new GetUnitByIdUseCase(repository);
    const createUnitUseCase = new CreateUnitUseCase(repository);
    const updateUnitUseCase = new UpdateUnitUseCase(repository);
    const deleteUnitUseCase = new DeleteUnitUseCase(repository);

    const controller = new UnitController(
      getUnitsUseCase,
      getUnitByIdUseCase,
      createUnitUseCase,
      updateUnitUseCase,
      deleteUnitUseCase
    );

    return createUnitRoutes(controller, userService);
  }
}
