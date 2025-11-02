import { Unit, UnitInput, UnitTenant, UnitTenantInput } from '../models/Unit';

export interface IUnitRepository {
  // Unit methods
  findAll(): Promise<Unit[]>;
  findById(id: string): Promise<Unit | null>;
  findByProperty(propertyId: string): Promise<Unit[]>;
  findByStatus(status: string): Promise<Unit[]>;
  create(data: UnitInput): Promise<Unit>;
  update(id: string, data: Partial<UnitInput>): Promise<Unit | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<boolean>;

  // Unit-Tenant relationship methods
  findUnitTenants(unitId: string): Promise<UnitTenant[]>;
  assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant>;
  removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean>;
  updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null>;
  findTenantAssignment(unitId: string, tenantId: string): Promise<UnitTenant | null>;
}