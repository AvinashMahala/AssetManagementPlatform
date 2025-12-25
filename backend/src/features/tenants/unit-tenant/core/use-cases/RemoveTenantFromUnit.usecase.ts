import { IUnitTenantRepository } from '@/features/tenants/unit-tenant/core/interfaces/IUnitTenantRepository.js';

export class RemoveTenantFromUnitUseCase {
  constructor(private repository: IUnitTenantRepository) {}

  async execute(unitId: string, tenantId: string): Promise<boolean> {
    return this.repository.removeTenantFromUnit(unitId, tenantId);
  }
}
