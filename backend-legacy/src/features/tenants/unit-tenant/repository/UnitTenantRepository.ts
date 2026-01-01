import { Pool } from 'pg';
import { IUnitTenantRepository } from './interfaces/IUnitTenantRepository.js';
import { UnitTenant, UnitTenantInput } from '../models/unit-tenant.types.js';
import { UnitTenantMapper } from './mappers/UnitTenantMapper.js';
import { UnitTenantRow } from './types/UnitTenantRow.js';
import { TABLES, COLUMNS } from '@/shared/constants/database.js';
import { RepositoryError } from '@/shared/errors/RepositoryError.js';

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
    try {
      const result = await this.pool.query<UnitTenantRow>(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1`,
        [unitId]
      );
      return result.rows.map((r) => UnitTenantMapper.toDomain(r));
    } catch (error) {
      throw new RepositoryError(
        `Failed to find unit tenants for unit ${unitId}: ${(error as Error).message || 'Database query failed'}`,
        'REPOSITORY_QUERY_ERROR',
        error as Error,
        { unitId, operation: 'findUnitTenants' }
      );
    }
  }

  /** Find all unit-tenant assignments (no filter) */
  async findAll(): Promise<UnitTenant[]> {
    try {
      const result = await this.pool.query<UnitTenantRow>(`SELECT * FROM ${TABLES.UNIT_TENANTS}`);
      return result.rows.map((r) => UnitTenantMapper.toDomain(r));
    } catch (error) {
      throw new RepositoryError(
        `Failed to find all unit tenants: ${(error as Error).message || 'Database query failed'}`,
        'REPOSITORY_QUERY_ERROR',
        error as Error,
        { operation: 'findAll' }
      );
    }
  }

  /** Find assignment by its id */
  async findById(id: string): Promise<UnitTenant | null> {
    try {
      const result = await this.pool.query<UnitTenantRow>(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.ID} = $1`,
        [id]
      );
      return result.rows[0] ? UnitTenantMapper.toDomain(result.rows[0]) : null;
    } catch (error) {
      throw new RepositoryError(
        `Failed to find unit tenant by id ${id}: ${(error as Error).message || 'Database query failed'}`,
        'REPOSITORY_QUERY_ERROR',
        error as Error,
        { id, operation: 'findById' }
      );
    }
  }

  /** Find all assignments for a given tenant */
  async findByTenant(tenantId: string): Promise<UnitTenant[]> {
    try {
      const result = await this.pool.query<UnitTenantRow>(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $1`,
        [tenantId]
      );
      return result.rows.map((r) => UnitTenantMapper.toDomain(r));
    } catch (error) {
      throw new RepositoryError(
        `Failed to find unit tenants for tenant ${tenantId}: ${(error as Error).message || 'Database query failed'}`,
        'REPOSITORY_QUERY_ERROR',
        error as Error,
        { tenantId, operation: 'findByTenant' }
      );
    }
  }

  /** Create a new tenant assignment */
  async assignTenantToUnit(data: UnitTenantInput): Promise<UnitTenant> {
    const now = new Date();
    try {
      const result = await this.pool.query<UnitTenantRow>(
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
      return UnitTenantMapper.toDomain(result.rows[0]);
    } catch (error) {
      throw new RepositoryError(
        `Failed to assign tenant ${data.tenantId} to unit ${data.unitId}: ${(error as Error).message || 'Database insert failed'}`,
        'REPOSITORY_INSERT_ERROR',
        error as Error,
        { unitId: data.unitId, tenantId: data.tenantId, operation: 'assignTenantToUnit' }
      );
    }
  }

  /** Update an existing tenant assignment; returns updated object or null */
  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    try {
      const { setClause, values } = this.buildUpdateClause(updates);
      if (!setClause) return await this.findTenantAssignment(unitId, tenantId);

      // Append updated_at and WHERE args
      values.push(new Date());
      const updatedAtIndex = values.length; // 1-based
      const whereUnitIdx = updatedAtIndex + 1;
      const whereTenantIdx = updatedAtIndex + 2;

      const query = `UPDATE ${TABLES.UNIT_TENANTS} SET ${setClause}, ${COLUMNS.UNIT_TENANTS.UPDATED_AT} = $${updatedAtIndex} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $${whereUnitIdx} AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $${whereTenantIdx} RETURNING *`;
      values.push(unitId, tenantId);

      const result = await this.pool.query<UnitTenantRow>(query, values);
      return result.rows[0] ? UnitTenantMapper.toDomain(result.rows[0]) : null;
    } catch (error) {
      throw new RepositoryError(
        `Failed to update tenant assignment for tenant ${tenantId} on unit ${unitId}: ${(error as Error).message || 'Database update failed'}`,
        'REPOSITORY_UPDATE_ERROR',
        error as Error,
        { unitId, tenantId, updates: { ...updates }, operation: 'updateTenantAssignment' }
      );
    }
  }

  /** Remove tenant from unit; returns true when a row was deleted */
  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1 AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $2`,
        [unitId, tenantId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new RepositoryError(
        `Failed to remove tenant ${tenantId} from unit ${unitId}: ${(error as Error).message || 'Database delete failed'}`,
        'REPOSITORY_DELETE_ERROR',
        error as Error,
        { unitId, tenantId, operation: 'removeTenantFromUnit' }
      );
    }
  }

  // Internal helper: fetch the assignment row by unitId + tenantId
  private async findTenantAssignment(unitId: string, tenantId: string): Promise<UnitTenant | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_TENANTS} WHERE ${COLUMNS.UNIT_TENANTS.UNIT_ID} = $1 AND ${COLUMNS.UNIT_TENANTS.TENANT_ID} = $2`,
        [unitId, tenantId]
      );
      return result.rows[0] ? UnitTenantMapper.toDomain(result.rows[0]) : null;
    } catch (error) {
      throw new RepositoryError(
        `Failed to find tenant assignment for tenant ${tenantId} on unit ${unitId}: ${(error as Error).message || 'Database query failed'}`,
        'REPOSITORY_QUERY_ERROR',
        error as Error,
        { unitId, tenantId, operation: 'findTenantAssignment' }
      );
    }
  }

  /**
   * Build SET clause and parameter values for an UPDATE statement based on
   * allowed fields. Returns empty clause when no updatable fields are present.
   */
  private buildUpdateClause(updates: Partial<UnitTenantInput>): { setClause: string; values: any[] } {
    const allowedFields: Array<{ key: keyof UnitTenantInput; col: string }> = [
      { key: 'isPrimaryTenant', col: COLUMNS.UNIT_TENANTS.IS_PRIMARY_TENANT },
      { key: 'moveInDate', col: COLUMNS.UNIT_TENANTS.MOVE_IN_DATE },
      { key: 'moveOutDate', col: COLUMNS.UNIT_TENANTS.MOVE_OUT_DATE },
      { key: 'monthlyRentShare', col: COLUMNS.UNIT_TENANTS.MONTHLY_RENT_SHARE },
      { key: 'securityDepositShare', col: COLUMNS.UNIT_TENANTS.SECURITY_DEPOSIT_SHARE },
      { key: 'status', col: COLUMNS.UNIT_TENANTS.STATUS },
    ];

    const parts: string[] = [];
    const values: any[] = [];

    for (const fld of allowedFields) {
      const val = (updates as any)[fld.key];
      if (val !== undefined) {
        parts.push(`${fld.col} = $${values.length + 1}`);
        values.push(val);
      }
    }

    return { setClause: parts.join(', '), values };
  }

  // NOTE: mapping logic moved to UnitTenantMapper
}
