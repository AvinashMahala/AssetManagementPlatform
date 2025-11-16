import { Unit, UnitInput, UnitTenant, UnitTenantInput } from '../../models/Unit';

export interface IUnitService {
  getAllUnits(): Promise<Unit[]>;
  getUnitById(id: string): Promise<Unit | null>;
  getUnitsByProperty(propertyId: string): Promise<Unit[]>;
  getUnitsByStatus(status: string): Promise<Unit[]>;
  createUnit(unitData: UnitInput): Promise<Unit>;
  updateUnit(id: string, unitData: Partial<UnitInput>): Promise<Unit | null>;
  deleteUnit(id: string): Promise<boolean>;
  updateUnitStatus(id: string, status: string): Promise<boolean>;
  getUnitTenants(unitId: string): Promise<UnitTenant[]>;

  // Unit-Tenant relationship methods
  assignTenantToUnit(unitTenantData: UnitTenantInput): Promise<UnitTenant>;
  removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean>;
  updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null>;

  // Analytics methods
  getUnitAnalytics(unitId: string): Promise<any>;
}