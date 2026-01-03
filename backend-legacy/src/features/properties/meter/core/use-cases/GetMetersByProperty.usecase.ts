import { IMeterRepository } from '../interfaces/IMeterRepository.js';
import { Meter } from '../types/meter.types.js';

export class GetMetersByProperty {
  constructor(private repository: IMeterRepository) {}

  async execute(propertyId: string): Promise<Meter[]> {
    return this.repository.findByProperty(propertyId);
  }
}
