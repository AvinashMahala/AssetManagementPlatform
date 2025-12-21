import { IUnitTenantRepository } from '@/features/tenants/unit-tenant/core/interfaces/IUnitTenantRepository.js';
import { UnitTenant } from '@/features/tenants/unit-tenant/core/types/unit-tenant.types.js';

export class GetUnitTenantsUseCase {
  constructor(private repository: IUnitTenantRepository) {}

  async execute(unitId: string): Promise<UnitTenant[]> {
    return this.repository.findUnitTenants(unitId);
  }
}
