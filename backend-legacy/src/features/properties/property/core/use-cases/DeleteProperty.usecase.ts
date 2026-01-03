import { IUseCase } from '@/shared/core/IUseCase.js';
import { IPropertyRepository } from '../interfaces/IPropertyRepository.js';
import { PropertyNotFoundError } from '../errors/PropertyNotFoundError.js';

export class DeletePropertyUseCase implements IUseCase<string, void> {
  constructor(private repository: IPropertyRepository) {}

  async execute(id: string): Promise<void> {
    const success = await this.repository.delete(id);
    if (!success) {
      throw new PropertyNotFoundError(id);
    }
  }
}
