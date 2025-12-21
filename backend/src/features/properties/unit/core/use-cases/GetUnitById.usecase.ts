import { IUseCase } from '@/shared/core/IUseCase.js';
import { IUnitRepository } from '../interfaces/IUnitRepository.js';
import { Unit } from '../types/unit.types.js';

export class GetUnitByIdUseCase implements IUseCase<string, Unit | null> {
  constructor(private repository: IUnitRepository) {}

  async execute(id: string): Promise<Unit | null> {
    return this.repository.findById(id);
  }
}
