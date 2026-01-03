/**
 * Database row shape for unit_tenants table
 *
 * Note: column names follow snake_case as returned by `pg`.
 */
export interface UnitTenantRow {
  id: string;
  unit_id: string;
  tenant_id: string;
  is_primary_tenant: boolean;
  move_in_date?: string | null;
  move_out_date?: string | null;
  monthly_rent_share: string | null;
  security_deposit_share: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export default UnitTenantRow;
