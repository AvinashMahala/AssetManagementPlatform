import { IUnitTenantRepository } from '@/features/tenants/unit-tenant/core/interfaces/IUnitTenantRepository';
import { UnitTenant } from '@/features/tenants/unit-tenant/core/types/unit-tenant.types';

export class GetUnitTenantByIdUseCase {
  constructor(private repository: IUnitTenantRepository) {}

  async execute(id: string): Promise<UnitTenant | null> {
    return this.repository.findById(id);
  }
}
