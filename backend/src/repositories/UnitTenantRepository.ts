import { Pool } from 'pg';
import { UnitTenant, UnitTenantInput } from '../models/Unit.js';
import { TABLES, COLUMNS } from '../constants/database.js';
import { IUnitTenantRepository } from '../interfaces/repositories/IUnitTenantRepository.js';

export class UnitTenantRepository implements IUnitTenantRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<UnitTenant[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.UNIT_TENANTS}`);
      return result.rows.map(row => this.mapRowToUnitTenant(row));
    } catch (error) {
      throw new Error('Failed to fetch unit tenant assignments');
    }
  }

  async findById(id: string): Promise<UnitTenant | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.ID} = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToUnitTenant(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to fetch unit tenant assignment');
    }
  }

  async findByUnitId(unitId: string): Promise<UnitTenant[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToUnitTenant(row));
    } catch (error) {
      throw new Error('Failed to fetch tenants by unit');
    }
  }

  async findByTenantId(tenantId: string): Promise<UnitTenant[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $1`,
        [tenantId]
      );
      return result.rows.map(row => this.mapRowToUnitTenant(row));
    } catch (error) {
      throw new Error('Failed to fetch units by tenant');
    }
  }

  async create(data: UnitTenantInput): Promise<UnitTenant> {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<UnitTenant, 'id' | 'createdAt' | 'updatedAt'>>): Promise<UnitTenant | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.isPrimaryTenant !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.IS_PRIMARY_TENANT} = $${paramIndex++}`);
        values.push(data.isPrimaryTenant);
      }
      if (data.moveInDate !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.MOVE_IN_DATE} = $${paramIndex++}`);
        values.push(data.moveInDate);
      }
      if (data.moveOutDate !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.MOVE_OUT_DATE} = $${paramIndex++}`);
        values.push(data.moveOutDate);
      }
      if (data.monthlyRentShare !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.MONTHLY_RENT_SHARE} = $${paramIndex++}`);
        values.push(data.monthlyRentShare);
      }
      if (data.securityDepositShare !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.SECURITY_DEPOSIT_SHARE} = $${paramIndex++}`);
        values.push(data.securityDepositShare);
      }
      if (data.status !== undefined) {
        fields.push(`${COLUMNS.UNIT_TENANTS.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`${COLUMNS.UNIT_TENANTS.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.UNIT_TENANTS} SET ${setClause} WHERE ${COLUMNS.UNIT_TENANTS.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToUnitTenant(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to delete unit tenant assignment');
    }
  }

  async deleteByUnitAndTenant(unitId: string, tenantId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1 AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $2`,
        [unitId, tenantId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to remove tenant from unit');
    }
  }

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