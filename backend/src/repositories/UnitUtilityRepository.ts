import { Pool } from 'pg';
import { UnitUtility, UnitUtilityInput, UtilityType, UtilityBillingMethod } from '../models/Unit.js';
import { TABLES, COLUMNS } from '../constants/database.js';
import { IUnitUtilityRepository } from '../interfaces/repositories/IUnitUtilityRepository';

export class UnitUtilityRepository implements IUnitUtilityRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(data: UnitUtilityInput): Promise<UnitUtility> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.UNIT_UTILITIES} (
          ${COLUMNS.UNIT_UTILITIES.ID},
          ${COLUMNS.UNIT_UTILITIES.UNIT_ID},
          ${COLUMNS.UNIT_UTILITIES.PROPERTY_ID},
          ${COLUMNS.UNIT_UTILITIES.UTILITY_TYPE},
          ${COLUMNS.UNIT_UTILITIES.UTILITY_NAME},
          ${COLUMNS.UNIT_UTILITIES.IS_ENABLED},
          ${COLUMNS.UNIT_UTILITIES.BILLING_METHOD},
          ${COLUMNS.UNIT_UTILITIES.FIXED_AMOUNT},
          ${COLUMNS.UNIT_UTILITIES.METER_ID},
          ${COLUMNS.UNIT_UTILITIES.MULTIPLIER},
          ${COLUMNS.UNIT_UTILITIES.CREATED_AT},
          ${COLUMNS.UNIT_UTILITIES.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
        [
          crypto.randomUUID(),
          data.unitId,
          data.propertyId,
          data.utilityType,
          data.utilityName,
          data.isEnabled ?? true,
          data.billingMethod,
          data.fixedAmount,
          data.meterId,
          data.multiplier ?? 1.0,
          now,
          now
        ]
      );
      return this.mapRowToUnitUtility(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create unit utility: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async findById(id: string): Promise<UnitUtility | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_UTILITIES} WHERE ${COLUMNS.UNIT_UTILITIES.ID} = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToUnitUtility(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find unit utility by ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findAll(): Promise<UnitUtility[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_UTILITIES} ORDER BY ${COLUMNS.UNIT_UTILITIES.PROPERTY_ID}, ${COLUMNS.UNIT_UTILITIES.UNIT_ID}, ${COLUMNS.UNIT_UTILITIES.UTILITY_TYPE}`,
        []
      );
      return result.rows.map(row => this.mapRowToUnitUtility(row));
    } catch (error) {
      throw new Error(`Failed to find all unit utilities: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByUnit(unitId: string): Promise<UnitUtility[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_UTILITIES} WHERE ${COLUMNS.UNIT_UTILITIES.UNIT_ID} = $1 ORDER BY ${COLUMNS.UNIT_UTILITIES.UTILITY_TYPE}`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToUnitUtility(row));
    } catch (error) {
      throw new Error(`Failed to find unit utilities by unit: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByUnitAndType(unitId: string, utilityType: UtilityType): Promise<UnitUtility | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_UTILITIES} WHERE ${COLUMNS.UNIT_UTILITIES.UNIT_ID} = $1 AND ${COLUMNS.UNIT_UTILITIES.UTILITY_TYPE} = $2`,
        [unitId, utilityType]
      );
      return result.rows[0] ? this.mapRowToUnitUtility(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to find unit utility by unit and type: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByProperty(propertyId: string): Promise<UnitUtility[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_UTILITIES} WHERE ${COLUMNS.UNIT_UTILITIES.PROPERTY_ID} = $1 ORDER BY ${COLUMNS.UNIT_UTILITIES.UNIT_ID}, ${COLUMNS.UNIT_UTILITIES.UTILITY_TYPE}`,
        [propertyId]
      );
      return result.rows.map(row => this.mapRowToUnitUtility(row));
    } catch (error) {
      throw new Error(`Failed to find unit utilities by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByMeter(meterId: string): Promise<UnitUtility[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_UTILITIES} WHERE ${COLUMNS.UNIT_UTILITIES.METER_ID} = $1`,
        [meterId]
      );
      return result.rows.map(row => this.mapRowToUnitUtility(row));
    } catch (error) {
      throw new Error(`Failed to find unit utilities by meter: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async update(id: string, data: Partial<UnitUtilityInput>): Promise<UnitUtility | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.utilityName !== undefined) {
        fields.push(`${COLUMNS.UNIT_UTILITIES.UTILITY_NAME} = $${paramIndex++}`);
        values.push(data.utilityName);
      }
      if (data.isEnabled !== undefined) {
        fields.push(`${COLUMNS.UNIT_UTILITIES.IS_ENABLED} = $${paramIndex++}`);
        values.push(data.isEnabled);
      }
      if (data.billingMethod !== undefined) {
        fields.push(`${COLUMNS.UNIT_UTILITIES.BILLING_METHOD} = $${paramIndex++}`);
        values.push(data.billingMethod);
      }
      if (data.fixedAmount !== undefined) {
        fields.push(`${COLUMNS.UNIT_UTILITIES.FIXED_AMOUNT} = $${paramIndex++}`);
        values.push(data.fixedAmount);
      }
      if (data.meterId !== undefined) {
        fields.push(`${COLUMNS.UNIT_UTILITIES.METER_ID} = $${paramIndex++}`);
        values.push(data.meterId);
      }
      if (data.multiplier !== undefined) {
        fields.push(`${COLUMNS.UNIT_UTILITIES.MULTIPLIER} = $${paramIndex++}`);
        values.push(data.multiplier);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`${COLUMNS.UNIT_UTILITIES.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.UNIT_UTILITIES} SET ${setClause} WHERE ${COLUMNS.UNIT_UTILITIES.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToUnitUtility(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to update unit utility: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async updateStatus(id: string, isEnabled: boolean): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.UNIT_UTILITIES} SET ${COLUMNS.UNIT_UTILITIES.IS_ENABLED} = $1, ${COLUMNS.UNIT_UTILITIES.UPDATED_AT} = $2 WHERE ${COLUMNS.UNIT_UTILITIES.ID} = $3`,
        [isEnabled, new Date(), id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update unit utility status: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.UNIT_UTILITIES} WHERE ${COLUMNS.UNIT_UTILITIES.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete unit utility: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async findEnabledByUnit(unitId: string): Promise<UnitUtility[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.UNIT_UTILITIES} WHERE ${COLUMNS.UNIT_UTILITIES.UNIT_ID} = $1 AND ${COLUMNS.UNIT_UTILITIES.IS_ENABLED} = true ORDER BY ${COLUMNS.UNIT_UTILITIES.UTILITY_TYPE}`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToUnitUtility(row));
    } catch (error) {
      throw new Error(`Failed to find enabled unit utilities: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  private mapRowToUnitUtility(row: any): UnitUtility {
    return {
      id: row.id,
      unitId: row.unit_id,
      propertyId: row.property_id,
      utilityType: row.utility_type as UtilityType,
      utilityName: row.utility_name,
      isEnabled: row.is_enabled,
      billingMethod: row.billing_method as UtilityBillingMethod,
      fixedAmount: row.fixed_amount ? parseFloat(row.fixed_amount) : undefined,
      meterId: row.meter_id,
      multiplier: row.multiplier ? parseFloat(row.multiplier) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}