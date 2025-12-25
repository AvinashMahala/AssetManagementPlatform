import { IUseCase } from '@/shared/core/IUseCase';
import { ITenantRepository } from '../interfaces/ITenantRepository';
import { TenantNotFoundError } from '../errors/TenantNotFoundError';

export class DeleteTenantUseCase implements IUseCase<string, void> {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(id: string): Promise<void> {
    const success = await this.tenantRepository.delete(id);
    if (!success) {
      throw new TenantNotFoundError(id);
    }
  }
}
