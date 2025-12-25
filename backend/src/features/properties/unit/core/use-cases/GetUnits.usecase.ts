import { IUseCase } from '@/shared/core/IUseCase.js';
import { IUnitRepository } from '../interfaces/IUnitRepository.js';
import { Unit } from '../types/unit.types.js';

export class GetUnitsUseCase implements IUseCase<{ propertyId?: string; status?: string }, Unit[]> {
  constructor(private repository: IUnitRepository) {}

  async execute(filters: { propertyId?: string; status?: string }): Promise<Unit[]> {
    if (filters.propertyId) {
      return this.repository.findByProperty(filters.propertyId);
    }
    if (filters.status) {
      return this.repository.findByStatus(filters.status);
    }
    return this.repository.findAll();
  }
}
