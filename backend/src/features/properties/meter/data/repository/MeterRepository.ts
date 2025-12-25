import { Pool } from 'pg';
import { IMeterRepository, MeterFilters } from '../../core/interfaces/IMeterRepository';
import { Meter, MeterInput } from '../../core/types/meter.types';
import { TABLES, COLUMNS } from '@/shared/constants/database';
import { PaginationOptions, PaginationResult } from '@/shared/types/pagination';

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

      const countQuery = `SELECT COUNT(*) as total FROM ${TABLES.METERS} ${whereClause}`;
      const countResult = await this.pool.query(countQuery, values);
      const total = parseInt(countResult.rows[0].total);

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
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.ID} = `,
        [id]
      );
      return result.rows[0] ? this.mapRowToMeter(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to fetch meter');
    }
  }

  async findByProperty(propertyId: string): Promise<Meter[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.PROPERTY_ID} =  ORDER BY ${COLUMNS.METERS.CREATED_AT} DESC`,
        [propertyId]
      );
      return result.rows.map(row => this.mapRowToMeter(row));
    } catch (error) {
      throw new Error('Failed to fetch meters by property');
    }
  }

  async findByUnit(unitId: string): Promise<Meter[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.UNIT_ID} =  ORDER BY ${COLUMNS.METERS.CREATED_AT} DESC`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToMeter(row));
    } catch (error) {
      throw new Error('Failed to fetch meters by unit');
    }
  }

  async findActiveByUnit(unitId: string): Promise<Meter[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.UNIT_ID} =  AND ${COLUMNS.METERS.IS_ACTIVE} = true ORDER BY ${COLUMNS.METERS.CREATED_AT} DESC`,
        [unitId]
      );
      return result.rows.map(row => this.mapRowToMeter(row));
    } catch (error) {
      throw new Error('Failed to fetch active meters by unit');
    }
  }

  async create(meterData: MeterInput): Promise<Meter> {
    try {
      const query = `
        INSERT INTO ${TABLES.METERS} (
          ${COLUMNS.METERS.UNIT_ID}, ${COLUMNS.METERS.PROPERTY_ID},
          ${COLUMNS.METERS.METER_TYPE}, ${COLUMNS.METERS.METER_NAME},
          ${COLUMNS.METERS.METER_NUMBER}, ${COLUMNS.METERS.MULTIPLIER},
          ${COLUMNS.METERS.REMARKS}, ${COLUMNS.METERS.COST_PER_UNIT},
          ${COLUMNS.METERS.FIXED_CHARGE}, ${COLUMNS.METERS.INSTALLATION_DATE},
          ${COLUMNS.METERS.STATUS}, ${COLUMNS.METERS.IS_ACTIVE}
        )
        VALUES (, , , , , , , , , , , )
        RETURNING *
      `;

      const values = [
        meterData.unitId,
        meterData.propertyId,
        meterData.meterType,
        meterData.meterName,
        meterData.meterNumber,
        meterData.multiplier || 1,
        meterData.remarks,
        meterData.costPerUnit,
        meterData.fixedCharge || 0,
        meterData.installationDate,
        meterData.status || 'active',
        meterData.isActive ?? true
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToMeter(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create meter: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, updates: Partial<Meter>): Promise<Meter | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.meterName !== undefined) {
        setClause.push(`${COLUMNS.METERS.METER_NAME} = $${paramIndex++}`);
        values.push(updates.meterName);
      }
      if (updates.meterNumber !== undefined) {
        setClause.push(`${COLUMNS.METERS.METER_NUMBER} = $${paramIndex++}`);
        values.push(updates.meterNumber);
      }
      if (updates.multiplier !== undefined) {
        setClause.push(`${COLUMNS.METERS.MULTIPLIER} = $${paramIndex++}`);
        values.push(updates.multiplier);
      }
      if (updates.remarks !== undefined) {
        setClause.push(`${COLUMNS.METERS.REMARKS} = $${paramIndex++}`);
        values.push(updates.remarks);
      }
      if (updates.costPerUnit !== undefined) {
        setClause.push(`${COLUMNS.METERS.COST_PER_UNIT} = $${paramIndex++}`);
        values.push(updates.costPerUnit);
      }
      if (updates.fixedCharge !== undefined) {
        setClause.push(`${COLUMNS.METERS.FIXED_CHARGE} = $${paramIndex++}`);
        values.push(updates.fixedCharge);
      }
      if (updates.status !== undefined) {
        setClause.push(`${COLUMNS.METERS.STATUS} = $${paramIndex++}`);
        values.push(updates.status);
      }
      if (updates.isActive !== undefined) {
        setClause.push(`${COLUMNS.METERS.IS_ACTIVE} = $${paramIndex++}`);
        values.push(updates.isActive);
      }

      if (setClause.length === 0) return null;

      values.push(id);
      const query = `
        UPDATE ${TABLES.METERS}
        SET ${setClause.join(', ')}, ${COLUMNS.METERS.UPDATED_AT} = CURRENT_TIMESTAMP
        WHERE ${COLUMNS.METERS.ID} = $${paramIndex}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToMeter(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to update meter');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.ID} = `,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to delete meter');
    }
  }

  async updateStatus(id: string, isActive: boolean): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.METERS} SET ${COLUMNS.METERS.IS_ACTIVE} = , ${COLUMNS.METERS.UPDATED_AT} = CURRENT_TIMESTAMP WHERE ${COLUMNS.METERS.ID} = `,
        [isActive, id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to update meter status');
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
      multiplier: parseFloat(row.multiplier),
      remarks: row.remarks,
      costPerUnit: parseFloat(row.cost_per_unit),
      fixedCharge: parseFloat(row.fixed_charge),
      installationDate: row.installation_date,
      status: row.status,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
