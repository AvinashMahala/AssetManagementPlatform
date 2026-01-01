import { UnitTenant, UnitTenantInput } from '../../models/unit-tenant.types';

/** Service interface for unit-tenant domain operations */
export interface IUnitTenantService {
  /** Get tenants assigned to a specific unit */
  findUnitTenants(unitId: string): Promise<UnitTenant[]>;
  /** Get assignments by tenant ID */
  findByTenant(tenantId: string): Promise<UnitTenant[]>;
  /** List all assignments */
  findAll(): Promise<UnitTenant[]>;
  /** Get assignment by ID */
  findById(id: string): Promise<UnitTenant | null>;
  /** Assign a tenant to a unit */
  assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant>;
  /** Update assignment fields */
  updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null>;
  /** Remove tenant assignment */
  removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean>;
}

export default IUnitTenantService;
