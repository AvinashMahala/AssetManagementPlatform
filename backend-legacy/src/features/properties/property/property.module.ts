import { Pool } from 'pg';
import { PropertyRepository } from './data/repository/PropertyRepository.js';
import { GetPropertiesUseCase } from './core/use-cases/GetProperties.usecase.js';
import { GetPropertyByIdUseCase } from './core/use-cases/GetPropertyById.usecase.js';
import { CreatePropertyUseCase } from './core/use-cases/CreateProperty.usecase.js';
import { UpdatePropertyUseCase } from './core/use-cases/UpdateProperty.usecase.js';
import { DeletePropertyUseCase } from './core/use-cases/DeleteProperty.usecase.js';
import { PropertyController } from './api/PropertyController.js';
import { createPropertyRoutes } from './api/property.routes.js';

export class PropertyModule {
  static create(pool: Pool, userService: any, legacyControllers?: { fileController?: any, receiptTemplateController?: any }) {
    const repository = new PropertyRepository(pool);
    
    const getPropertiesUseCase = new GetPropertiesUseCase(repository);
    const getPropertyByIdUseCase = new GetPropertyByIdUseCase(repository);
    const createPropertyUseCase = new CreatePropertyUseCase(repository);
    const updatePropertyUseCase = new UpdatePropertyUseCase(repository);
    const deletePropertyUseCase = new DeletePropertyUseCase(repository);

    const controller = new PropertyController(
      getPropertiesUseCase,
      getPropertyByIdUseCase,
      createPropertyUseCase,
      updatePropertyUseCase,
      deletePropertyUseCase
    );

    return createPropertyRoutes(controller, userService, legacyControllers?.fileController, legacyControllers?.receiptTemplateController);
  }
}
