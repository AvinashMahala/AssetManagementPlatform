import { UnitTenant, UnitTenantInput } from '../../models/Unit';

export interface IUnitTenantService {
  getAllAssignments(): Promise<UnitTenant[]>;
  getAssignmentById(id: string): Promise<UnitTenant | null>;
  getTenantsByUnit(unitId: string): Promise<UnitTenant[]>;
  getUnitsByTenant(tenantId: string): Promise<UnitTenant[]>;
  assignTenantToUnit(assignmentData: UnitTenantInput): Promise<UnitTenant>;
  removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean>;
  updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null>;
}