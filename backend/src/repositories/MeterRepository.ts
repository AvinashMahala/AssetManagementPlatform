import { Pool } from 'pg';
import { Meter, MeterInput } from '../models/Meter.js';
import { TABLES, COLUMNS } from '../constants/database.js';
import { IMeterRepository } from '../interfaces/repositories/IMeterRepository.js';
import { PaginationOptions, PaginationResult, MeterFilters } from '../types/pagination.js';

export class MeterRepository implements IMeterRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Meter[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.METERS} ORDER BY ${COLUMNS.METERS.CREATED_AT} DESC`);
      return result.rows.map(row => this.mapRowToMeter(row));
    } catch (error) {
      throw new Error(`Failed to fetch meters: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findPaginated(options: PaginationOptions, filters?: MeterFilters): Promise<PaginationResult<Meter>> {
    try {
      const { page, limit } = options;
      const offset = (page - 1) * limit;

      // Build WHERE clause
      const whereConditions: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (filters?.search) {
        whereConditions.push(`(${COLUMNS.METERS.METER_NAME} ILIKE $${paramIndex} OR ${COLUMNS.METERS.METER_NUMBER} ILIKE $${paramIndex})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
      }

      if (filters?.meterType) {
        whereConditions.push(`${COLUMNS.METERS.METER_TYPE} = $${paramIndex}`);
        values.push(filters.meterType);
        paramIndex++;
      }

      if (filters?.status) {
        const isActive = filters.status === 'active';
        whereConditions.push(`${COLUMNS.METERS.IS_ACTIVE} = $${paramIndex}`);
        values.push(isActive);
        paramIndex++;
      }

      if (filters?.propertyId) {
        whereConditions.push(`${COLUMNS.METERS.PROPERTY_ID} = $${paramIndex}`);
        values.push(filters.propertyId);
        paramIndex++;
      }

      if (filters?.unitId) {
        whereConditions.push(`${COLUMNS.METERS.UNIT_ID} = $${paramIndex}`);
        values.push(filters.unitId);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM ${TABLES.METERS} ${whereClause}`;
      const countResult = await this.pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT * FROM ${TABLES.METERS}
        ${whereClause}
        ORDER BY ${COLUMNS.METERS.CREATED_AT} DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      values.push(limit, offset);

      const dataResult = await this.pool.query(dataQuery, values);
      const data = dataResult.rows.map(row => this.mapRowToMeter(row));

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev
      };
    } catch (error) {
      throw new Error(`Failed to fetch paginated meters: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<Meter | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.ID} = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToMeter(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to fetch meter: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByUnit(unitId: string): Promise<Meter[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.UNIT_ID} = $1 ORDER BY ${COLUMNS.METERS.METER_TYPE}, ${COLUMNS.METERS.CREATED_AT}`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToMeter(row));
    } catch (error) {
      throw new Error(`Failed to fetch meters by unit: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByProperty(propertyId: string): Promise<Meter[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.PROPERTY_ID} = $1 ORDER BY ${COLUMNS.METERS.UNIT_ID}, ${COLUMNS.METERS.METER_TYPE}`,
        [propertyId]
      );
      return result.rows.map(row => this.mapRowToMeter(row));
    } catch (error) {
      throw new Error(`Failed to fetch meters by property: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findActiveByUnit(unitId: string): Promise<Meter[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.UNIT_ID} = $1 AND ${COLUMNS.METERS.IS_ACTIVE} = true ORDER BY ${COLUMNS.METERS.METER_TYPE}`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToMeter(row));
    } catch (error) {
      throw new Error(`Failed to fetch active meters by unit: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async create(data: Omit<Meter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meter> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.METERS} (
          ${COLUMNS.METERS.ID},
          ${COLUMNS.METERS.UNIT_ID},
          ${COLUMNS.METERS.PROPERTY_ID},
          ${COLUMNS.METERS.METER_TYPE},
          ${COLUMNS.METERS.METER_NAME},
          ${COLUMNS.METERS.METER_NUMBER},
          ${COLUMNS.METERS.MULTIPLIER},
          ${COLUMNS.METERS.COST_PER_UNIT},
          ${COLUMNS.METERS.FIXED_CHARGE},
          ${COLUMNS.METERS.INSTALLATION_DATE},
          ${COLUMNS.METERS.STATUS},
          ${COLUMNS.METERS.REMARKS},
          ${COLUMNS.METERS.IS_ACTIVE},
          ${COLUMNS.METERS.CREATED_AT},
          ${COLUMNS.METERS.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [
          crypto.randomUUID(),
          data.unitId,
          data.propertyId,
          data.meterType,
          data.meterName,
          data.meterNumber,
          data.multiplier !== undefined ? data.multiplier : 1.0,
          data.costPerUnit,
          data.fixedCharge,
          data.installationDate,
          data.status !== undefined ? data.status : 'active',
          data.remarks,
          data.isActive !== undefined ? data.isActive : true,
          now,
          now
        ]
      );
      return this.mapRowToMeter(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create meter: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, data: Partial<Omit<Meter, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Meter | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.unitId !== undefined) {
        fields.push(`${COLUMNS.METERS.UNIT_ID} = $${paramIndex++}`);
        values.push(data.unitId);
      }
      if (data.propertyId !== undefined) {
        fields.push(`${COLUMNS.METERS.PROPERTY_ID} = $${paramIndex++}`);
        values.push(data.propertyId);
      }
      if (data.meterType !== undefined) {
        fields.push(`${COLUMNS.METERS.METER_TYPE} = $${paramIndex++}`);
        values.push(data.meterType);
      }
      if (data.meterName !== undefined) {
        fields.push(`${COLUMNS.METERS.METER_NAME} = $${paramIndex++}`);
        values.push(data.meterName);
      }
      if (data.meterNumber !== undefined) {
        fields.push(`${COLUMNS.METERS.METER_NUMBER} = $${paramIndex++}`);
        values.push(data.meterNumber);
      }
      if (data.multiplier !== undefined) {
        fields.push(`${COLUMNS.METERS.MULTIPLIER} = $${paramIndex++}`);
        values.push(data.multiplier);
      }
      if (data.costPerUnit !== undefined) {
        fields.push(`${COLUMNS.METERS.COST_PER_UNIT} = $${paramIndex++}`);
        values.push(data.costPerUnit);
      }
      if (data.fixedCharge !== undefined) {
        fields.push(`${COLUMNS.METERS.FIXED_CHARGE} = $${paramIndex++}`);
        values.push(data.fixedCharge);
      }
      if (data.installationDate !== undefined) {
        fields.push(`${COLUMNS.METERS.INSTALLATION_DATE} = $${paramIndex++}`);
        values.push(data.installationDate);
      }
      if (data.status !== undefined) {
        fields.push(`${COLUMNS.METERS.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.remarks !== undefined) {
        fields.push(`${COLUMNS.METERS.REMARKS} = $${paramIndex++}`);
        values.push(data.remarks);
      }
      if (data.isActive !== undefined) {
        fields.push(`${COLUMNS.METERS.IS_ACTIVE} = $${paramIndex++}`);
        values.push(data.isActive);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`${COLUMNS.METERS.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.METERS} SET ${setClause} WHERE ${COLUMNS.METERS.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToMeter(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to update meter: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete meter: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async updateStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.METERS} SET ${COLUMNS.METERS.IS_ACTIVE} = $1, ${COLUMNS.METERS.UPDATED_AT} = $2 WHERE ${COLUMNS.METERS.ID} = $3`,
        [isActive, new Date(), id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to update meter status: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  private mapRowToMeter(row: any): Meter {
    return {
      id: row.id,
      unitId: row.unit_id,
      propertyId: row.property_id,
      meterType: row.meter_type,
      meterName: row.meter_name,
      meterNumber: row.meter_number,
      multiplier: parseFloat(row.multiplier) || 1.0,
      costPerUnit: parseFloat(row.cost_per_unit) || 0,
      fixedCharge: row.fixed_charge ? parseFloat(row.fixed_charge) : undefined,
      installationDate: row.installation_date ? new Date(row.installation_date) : undefined,
      status: row.status || 'active',
      remarks: row.remarks,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}