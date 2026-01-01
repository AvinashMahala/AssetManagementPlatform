import { IUseCase } from '@/shared/core/IUseCase.js';
import { IUnitRepository } from '../interfaces/IUnitRepository.js';

export class DeleteUnitUseCase implements IUseCase<string, void> {
  constructor(private repository: IUnitRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error('Unit not found');
    }
  }
}
