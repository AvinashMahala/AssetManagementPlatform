import { IUseCase } from '@/shared/core/IUseCase.js';
import { IPropertyRepository } from '../interfaces/IPropertyRepository.js';
import { Property } from '../types/property.types.js';

export class GetPropertiesUseCase implements IUseCase<{ ownerId?: string }, Property[]> {
  constructor(private repository: IPropertyRepository) {}

  async execute(request: { ownerId?: string }): Promise<Property[]> {
    if (request.ownerId) {
      return this.repository.findByOwner(request.ownerId);
    }
    return this.repository.findAll();
  }
}
