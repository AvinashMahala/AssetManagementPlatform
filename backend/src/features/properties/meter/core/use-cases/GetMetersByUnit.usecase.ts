import { IMeterRepository } from '../interfaces/IMeterRepository.js';
import { Meter } from '../types/meter.types.js';

export class GetMetersByUnit {
  constructor(private repository: IMeterRepository) {}

  async execute(unitId: string): Promise<Meter[]> {
    return this.repository.findByUnit(unitId);
  }
}
