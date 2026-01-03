import { IUseCase } from '@/shared/core/IUseCase.js';
import { IPropertyRepository } from '../interfaces/IPropertyRepository.js';
import { Property } from '../types/property.types.js';
import { PropertyNotFoundError } from '../errors/PropertyNotFoundError.js';

export class GetPropertyByIdUseCase implements IUseCase<string, Property> {
  constructor(private repository: IPropertyRepository) {}

  async execute(id: string): Promise<Property> {
    const property = await this.repository.findById(id);
    if (!property) {
      throw new PropertyNotFoundError(id);
    }
    return property;
  }
}
