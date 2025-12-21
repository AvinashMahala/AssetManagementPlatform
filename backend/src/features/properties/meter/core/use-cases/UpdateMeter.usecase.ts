import { IMeterRepository } from '../interfaces/IMeterRepository.js';
import { Meter, MeterInput } from '../types/meter.types.js';

export class UpdateMeter {
  constructor(private repository: IMeterRepository) {}

  async execute(id: string, data: Partial<MeterInput>): Promise<Meter | null> {
    return this.repository.update(id, data);
  }
}
