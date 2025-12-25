import { IUseCase } from '@/shared/core/IUseCase';
import { ITenantRepository } from '../interfaces/ITenantRepository';
import { Tenant } from '../types/tenant.types';
import { TenantNotFoundError } from '../errors/TenantNotFoundError';

export class GetTenantByIdUseCase implements IUseCase<string, Tenant> {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new TenantNotFoundError(id);
    }
    return tenant;
  }
}
