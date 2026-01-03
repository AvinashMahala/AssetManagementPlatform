import { UnitTenant } from '../../models/unit-tenant.types';
import { UnitTenantRow } from '../types/UnitTenantRow';

/**
 * Mapper for unit_tenants DB rows -> domain objects
 */
export class UnitTenantMapper {
  static toDomain(row: UnitTenantRow): UnitTenant {
    return {
      id: row.id,
      unitId: row.unit_id,
      tenantId: row.tenant_id,
      isPrimaryTenant: row.is_primary_tenant,
      moveInDate: row.move_in_date ? new Date(row.move_in_date) : undefined,
      moveOutDate: row.move_out_date ? new Date(row.move_out_date) : undefined,
      monthlyRentShare: parseFloat(String(row.monthly_rent_share)),
      securityDepositShare: parseFloat(String(row.security_deposit_share)),
      status: row.status as any,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export default UnitTenantMapper;
