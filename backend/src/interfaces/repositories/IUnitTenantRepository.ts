import { UnitTenant, UnitTenantInput } from '../../models/Unit';

export interface IUnitTenantRepository {
  findAll(): Promise<UnitTenant[]>;
  findById(id: string): Promise<UnitTenant | null>;
  findByUnitId(unitId: string): Promise<UnitTenant[]>;
  findByTenantId(tenantId: string): Promise<UnitTenant[]>;
  create(data: UnitTenantInput): Promise<UnitTenant>;
  update(id: string, data: Partial<Omit<UnitTenant, 'id' | 'assignedAt' | 'updatedAt'>>): Promise<UnitTenant | null>;
  delete(id: string): Promise<boolean>;
  deleteByUnitAndTenant(unitId: string, tenantId: string): Promise<boolean>;
}