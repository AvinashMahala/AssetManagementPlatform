import { IMeterRepository } from '../interfaces/IMeterRepository.js';
import { Meter, MeterInput } from '../types/meter.types.js';

export class CreateMeter {
  constructor(private repository: IMeterRepository) {}

  async execute(data: MeterInput): Promise<Meter> {
    return this.repository.create(data);
  }
}
