import { IMeterRepository } from '../interfaces/IMeterRepository.js';

export class DeleteMeter {
  constructor(private repository: IMeterRepository) {}

  async execute(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
