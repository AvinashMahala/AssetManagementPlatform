import { IUnitTenantService } from '../interfaces/IUnitTenantService';
import { IUnitTenantRepository } from '../../repository/interfaces/IUnitTenantRepository';
import { UnitTenant, UnitTenantInput } from '../../models/unit-tenant.types';

/**
 * Service layer for unit-tenant operations
 *
 * Delegates to repository for persistence and exposes a thin domain API used
 * by controllers and higher-level modules.
 */
export class UnitTenantService implements IUnitTenantService {
  constructor(private readonly repository: IUnitTenantRepository) {}

  /** Get tenants assigned to a unit */
  async findUnitTenants(unitId: string): Promise<UnitTenant[]> {
    return this.repository.findUnitTenants(unitId);
  }

  /** Get assignments by tenant */
  async findByTenant(tenantId: string): Promise<UnitTenant[]> {
    return this.repository.findByTenant(tenantId);
  }

  /** Get all assignments */
  async findAll(): Promise<UnitTenant[]> {
    return this.repository.findAll();
  }

  /** Get a specific assignment */
  async findById(id: string): Promise<UnitTenant | null> {
    return this.repository.findById(id);
  }

  /** Assign a tenant to a unit */
  async assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant> {
    return this.repository.assignTenantToUnit(data);
  }

  /** Update assignment details */
  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    return this.repository.updateTenantAssignment(unitId, tenantId, updates);
  }

  /** Remove tenant from a unit */
  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    return this.repository.removeTenantFromUnit(unitId, tenantId);
  }
}

export default UnitTenantService;
