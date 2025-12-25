import { UnitTenant, UnitTenantInput } from '../types/unit-tenant.types';

export interface IUnitTenantRepository {
  findUnitTenants(unitId: string): Promise<UnitTenant[]>;
  findAll(): Promise<UnitTenant[]>;
  findById(id: string): Promise<UnitTenant | null>;
  findByTenant(tenantId: string): Promise<UnitTenant[]>;
  assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant>;
  updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null>;
  removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean>;
}
