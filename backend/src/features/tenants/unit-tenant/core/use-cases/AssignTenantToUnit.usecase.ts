import { IUnitTenantRepository } from '@/features/tenants/unit-tenant/core/interfaces/IUnitTenantRepository.js';
import { UnitTenant, UnitTenantInput } from '@/features/tenants/unit-tenant/core/types/unit-tenant.types.js';

export class AssignTenantToUnitUseCase {
  constructor(private repository: IUnitTenantRepository) {}

  async execute(data: UnitTenantInput): Promise<UnitTenant> {
    return this.repository.assignTenantToUnit(data);
  }
}
