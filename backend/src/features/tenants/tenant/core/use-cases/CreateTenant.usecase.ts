import { IUseCase } from '@/shared/core/IUseCase';
import { ITenantRepository } from '../interfaces/ITenantRepository';
import { CreateTenantDTO, Tenant } from '../types/tenant.types';

export class CreateTenantUseCase implements IUseCase<CreateTenantDTO, Tenant> {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(request: CreateTenantDTO): Promise<Tenant> {
    const existingTenant = await this.tenantRepository.findByEmail(request.email);
    if (existingTenant) {
      throw new Error(`Tenant with email ${request.email} already exists`);
    }
    return this.tenantRepository.create(request);
  }
}
