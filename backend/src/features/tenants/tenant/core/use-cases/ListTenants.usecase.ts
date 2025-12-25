import { IUseCase } from '@/shared/core/IUseCase';
import { ITenantRepository } from '../interfaces/ITenantRepository';
import { Tenant } from '../types/tenant.types';

export class ListTenantsUseCase implements IUseCase<void, Tenant[]> {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(): Promise<Tenant[]> {
    return this.tenantRepository.findAll();
  }
}
