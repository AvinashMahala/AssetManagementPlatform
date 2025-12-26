import { Pool } from 'pg';
import { IUnitTenantRepository } from './interfaces/IUnitTenantRepository.js';
import { UnitTenant, UnitTenantInput } from '../models/unit-tenant.types.js';
import { TABLES, COLUMNS } from '@/shared/constants/database.js';

/**
 * Repository for unit-tenant assignments
 *
 * Responsible for all DB interactions related to unit-tenants table. Methods
 * return domain objects (UnitTenant) and perform low-level SQL queries.
 */
export class UnitTenantRepository implements IUnitTenantRepository {
  constructor(private pool: Pool) {}

  /** Find tenant assignments for a given unit */
  async findUnitTenants(unitId: string): Promise<UnitTenant[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1`,
      [unitId]
    );
    return result.rows.map(this.mapRowToUnitTenant);
  }

  /** Find all unit-tenant assignments (no filter) */
  async findAll(): Promise<UnitTenant[]> {
    const result = await this.pool.query(`SELECT * FROM ${TABLES.UNIT_TENANTS}`);
    return result.rows.map(this.mapRowToUnitTenant);
  }

  /** Find assignment by its id */
  async findById(id: string): Promise<UnitTenant | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.ID} = $1`,
      [id]
    );
    return result.rows[0] ? this.mapRowToUnitTenant(result.rows[0]) : null;
  }

  /** Find all assignments for a given tenant */
  async findByTenant(tenantId: string): Promise<UnitTenant[]> {
    const result = await this.pool.query(
      `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $1`,
      [tenantId]
    );
    return result.rows.map(this.mapRowToUnitTenant);
  }

  /** Create a new tenant assignment */
  async assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant> {
    const now = new Date();
    const result = await this.pool.query(
      `INSERT INTO ${TABLES.UNIT_TENANTS} (
        ${COLUMNS.UNIT_TENANTS.ID},
        ${COLUMNS.UNIT_TENANTS.UNIT_ID},
        ${COLUMNS.UNIT_TENANTS.TENANT_ID},
        ${COLUMNS.UNIT_TENANTS.IS_PRIMARY_TENANT},
        ${COLUMNS.UNIT_TENANTS.MOVE_IN_DATE},
        ${COLUMNS.UNIT_TENANTS.MOVE_OUT_DATE},
        ${COLUMNS.UNIT_TENANTS.MONTHLY_RENT_SHARE},
        ${COLUMNS.UNIT_TENANTS.SECURITY_DEPOSIT_SHARE},
        ${COLUMNS.UNIT_TENANTS.STATUS},
        ${COLUMNS.UNIT_TENANTS.CREATED_AT},
        ${COLUMNS.UNIT_TENANTS.UPDATED_AT}
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        crypto.randomUUID(),
        data.unitId,
        data.tenantId,
        data.isPrimaryTenant || false,
        data.moveInDate,
        data.moveOutDate,
        data.monthlyRentShare,
        data.securityDepositShare,
        data.status || 'active',
        now,
        now
      ]
    );
    return this.mapRowToUnitTenant(result.rows[0]);
  }

  /** Update an existing tenant assignment; returns updated object or null */
  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.isPrimaryTenant !== undefined) {
      fields.push(`${COLUMNS.UNIT_TENANTS.IS_PRIMARY_TENANT} = $${paramIndex++}`);
      values.push(updates.isPrimaryTenant);
    }
    if (updates.moveInDate !== undefined) {
      fields.push(`${COLUMNS.UNIT_TENANTS.MOVE_IN_DATE} = $${paramIndex++}`);
      values.push(updates.moveInDate);
    }
    if (updates.moveOutDate !== undefined) {
      fields.push(`${COLUMNS.UNIT_TENANTS.MOVE_OUT_DATE} = $${paramIndex++}`);
      values.push(updates.moveOutDate);
    }
    if (updates.monthlyRentShare !== undefined) {
      fields.push(`${COLUMNS.UNIT_TENANTS.MONTHLY_RENT_SHARE} = $${paramIndex++}`);
      values.push(updates.monthlyRentShare);
    }
    if (updates.securityDepositShare !== undefined) {
      fields.push(`${COLUMNS.UNIT_TENANTS.SECURITY_DEPOSIT_SHARE} = $${paramIndex++}`);
      values.push(updates.securityDepositShare);
    }
    if (updates.status !== undefined) {
      fields.push(`${COLUMNS.UNIT_TENANTS.STATUS} = $${paramIndex++}`);
      values.push(updates.status);
    }

    if (fields.length === 0) {
      return await this.findTenantAssignment(unitId, tenantId);
    }

    fields.push(`${COLUMNS.UNIT_TENANTS.UPDATED_AT} = $${paramIndex++}`);
    values.push(new Date());

    const setClause = fields.join(', ');
    const query = `UPDATE ${TABLES.UNIT_TENANTS} SET ${setClause} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $${paramIndex} AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $${paramIndex + 1} RETURNING *`;
    values.push(unitId, tenantId);

    const result = await this.pool.query(query, values);
    return result.rows[0] ? this.mapRowToUnitTenant(result.rows[0]) : null;
  }

  /** Remove tenant from unit; returns true when a row was deleted */
  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    const result = await this.pool.query(
      `DELETE FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1 AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $2`,
      [unitId, tenantId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Internal helper: fetch the assignment row by unitId + tenantId
  private async findTenantAssignment(unitId: string, tenantId: string): Promise<UnitTenant | null> {
    const result = await this.pool.query(
      `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1 AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $2`,
      [unitId, tenantId]
    );
    return result.rows[0] ? this.mapRowToUnitTenant(result.rows[0]) : null;
  }

  // Map DB row to UnitTenant domain object; converts dates & numbers
  private mapRowToUnitTenant(row: any): UnitTenant {
    return {
      id: row.id,
      unitId: row.unit_id,
      tenantId: row.tenant_id,
      isPrimaryTenant: row.is_primary_tenant,
      moveInDate: row.move_in_date ? new Date(row.move_in_date) : undefined,
      moveOutDate: row.move_out_date ? new Date(row.move_out_date) : undefined,
      monthlyRentShare: parseFloat(row.monthly_rent_share),
      securityDepositShare: parseFloat(row.security_deposit_share),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
