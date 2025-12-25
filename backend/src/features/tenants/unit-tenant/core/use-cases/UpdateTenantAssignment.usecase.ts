import { IUnitTenantRepository } from '@/features/tenants/unit-tenant/core/interfaces/IUnitTenantRepository.js';
import { UnitTenant, UnitTenantInput } from '@/features/tenants/unit-tenant/core/types/unit-tenant.types.js';

export class UpdateTenantAssignmentUseCase {
  constructor(private repository: IUnitTenantRepository) {}

  async execute(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    return this.repository.updateTenantAssignment(unitId, tenantId, updates);
  }
}
