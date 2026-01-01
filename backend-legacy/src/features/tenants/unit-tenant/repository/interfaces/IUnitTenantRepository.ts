import { UnitTenant, UnitTenantInput } from '../../models/unit-tenant.types';

/** Repository interface for unit-tenant persistence operations */
export interface IUnitTenantRepository {
  /** Find tenant assignments for a unit */
  findUnitTenants(unitId: string): Promise<UnitTenant[]>;
  /** Find all assignments */
  findAll(): Promise<UnitTenant[]>;
  /** Find assignment by id */
  findById(id: string): Promise<UnitTenant | null>;
  /** Find assignments for a tenant */
  findByTenant(tenantId: string): Promise<UnitTenant[]>;
  /** Create a new assignment */
  assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant>;
  /** Update assignment details */
  updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null>;
  /** Remove tenant from unit */
  removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean>;
}
