import { IUnitTenantRepository } from '@/features/tenants/unit-tenant/core/interfaces/IUnitTenantRepository.js';
import { UnitTenant } from '@/features/tenants/unit-tenant/core/types/unit-tenant.types.js';

export class GetUnitTenantsQueryUseCase {
  constructor(private repository: IUnitTenantRepository) {}

  async execute(filters: { unitId?: string; tenantId?: string }): Promise<UnitTenant[]> {
    if (filters.unitId) {
      return this.repository.findUnitTenants(filters.unitId);
    }
    if (filters.tenantId) {
      return this.repository.findByTenant(filters.tenantId);
    }
    return this.repository.findAll();
  }
}
