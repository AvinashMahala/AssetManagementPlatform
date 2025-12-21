import { Router } from 'express';
import { Pool } from 'pg';
import { MeterRepository } from './data/repository/MeterRepository.js';
import { GetMetersByProperty } from './core/use-cases/GetMetersByProperty.usecase.js';
import { GetMetersByUnit } from './core/use-cases/GetMetersByUnit.usecase.js';
import { CreateMeter } from './core/use-cases/CreateMeter.usecase.js';
import { UpdateMeter } from './core/use-cases/UpdateMeter.usecase.js';
import { DeleteMeter } from './core/use-cases/DeleteMeter.usecase.js';
import { ListMeters } from './core/use-cases/ListMeters.usecase.js';
import { MeterController } from './presentation/controllers/MeterController.js';
import { createMeterRoutes } from './presentation/routes/meter.routes.js';
import { authMiddleware } from '@/shared/middleware/authMiddleware.js';

export class MeterModule {
  static create(pool: Pool, userService: any): Router {
    const repository = new MeterRepository(pool);

    const getMetersByProperty = new GetMetersByProperty(repository);
    const getMetersByUnit = new GetMetersByUnit(repository);
    const createMeter = new CreateMeter(repository);
    const updateMeter = new UpdateMeter(repository);
    const deleteMeter = new DeleteMeter(repository);
    const listMeters = new ListMeters(repository);

    const controller = new MeterController(
      getMetersByProperty,
      getMetersByUnit,
      createMeter,
      updateMeter,
      deleteMeter,
      listMeters
    );

    const auth = authMiddleware(userService);
    return createMeterRoutes(controller, auth);
  }
}
