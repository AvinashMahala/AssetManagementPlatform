import { Pool } from 'pg';
import { IMeterReadingRepository } from '../../core/interfaces/IMeterReadingRepository';
import { MeterReading, MeterReadingInput } from '../../core/types/meter.types';
import { TABLES, COLUMNS } from '@/shared/constants/database';

export class MeterReadingRepository implements IMeterReadingRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<MeterReading[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.METER_READINGS} ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC`);
      return result.rows.map(row => this.mapRowToMeterReading(row));
    } catch (error) {
      throw new Error('Failed to fetch meter readings');
    }
  }

  async findById(id: string): Promise<MeterReading | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.ID} = `,
        [id]
      );
      return result.rows[0] ? this.mapRowToMeterReading(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to fetch meter reading');
    }
  }

  async findByMeter(meterId: string): Promise<MeterReading[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} =  ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC`,
        [meterId]
      );
      return result.rows.map(row => this.mapRowToMeterReading(row));
    } catch (error) {
      throw new Error('Failed to fetch meter readings by meter');
    }
  }

  async findByMeterAndDateRange(meterId: string, startDate: Date, endDate: Date): Promise<MeterReading[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} =  AND ${COLUMNS.METER_READINGS.READING_DATE} BETWEEN  AND  ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC`,
        [meterId, startDate, endDate]
      );
      return result.rows.map(row => this.mapRowToMeterReading(row));
    } catch (error) {
      throw new Error('Failed to fetch meter readings by date range');
    }
  }

  async findLatestByMeter(meterId: string): Promise<MeterReading | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} =  ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC LIMIT 1`,
        [meterId]
      );
      return result.rows[0] ? this.mapRowToMeterReading(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to fetch latest meter reading');
    }
  }

  async create(readingData: MeterReadingInput & { previousReading: number; unitsConsumed: number; totalCost: number }): Promise<MeterReading> {
    try {
      const query = `
        INSERT INTO ${TABLES.METER_READINGS} (
          ${COLUMNS.METER_READINGS.METER_ID}, ${COLUMNS.METER_READINGS.READING_DATE},
          ${COLUMNS.METER_READINGS.PREVIOUS_READING}, ${COLUMNS.METER_READINGS.CURRENT_READING},
          ${COLUMNS.METER_READINGS.UNITS_CONSUMED}, ${COLUMNS.METER_READINGS.TOTAL_COST},
          ${COLUMNS.METER_READINGS.METER_PHOTO_URL}, ${COLUMNS.METER_READINGS.RECORDED_BY}
        )
        VALUES (, , , , , , , )
        RETURNING *
      `;

      const values = [
        readingData.meterId,
        readingData.readingDate,
        readingData.previousReading,
        readingData.currentReading,
        readingData.unitsConsumed,
        readingData.totalCost,
        readingData.meterPhotoUrl,
        readingData.recordedBy
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToMeterReading(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create meter reading: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, updates: Partial<MeterReading>): Promise<MeterReading | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.currentReading !== undefined) {
        setClause.push(`${COLUMNS.METER_READINGS.CURRENT_READING} = $${paramIndex++}`);
        values.push(updates.currentReading);
      }
      if (updates.unitsConsumed !== undefined) {
        setClause.push(`${COLUMNS.METER_READINGS.UNITS_CONSUMED} = $${paramIndex++}`);
        values.push(updates.unitsConsumed);
      }
      if (updates.totalCost !== undefined) {
        setClause.push(`${COLUMNS.METER_READINGS.TOTAL_COST} = $${paramIndex++}`);
        values.push(updates.totalCost);
      }
      if (updates.meterPhotoUrl !== undefined) {
        setClause.push(`${COLUMNS.METER_READINGS.METER_PHOTO_URL} = $${paramIndex++}`);
        values.push(updates.meterPhotoUrl);
      }

      if (setClause.length === 0) return null;

      values.push(id);
      const query = `
        UPDATE ${TABLES.METER_READINGS}
        SET ${setClause.join(', ')}
        WHERE ${COLUMNS.METER_READINGS.ID} = $${paramIndex}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToMeterReading(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to update meter reading');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.ID} = `,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to delete meter reading');
    }
  }

  private mapRowToMeterReading(row: any): MeterReading {
    return {
      id: row.id,
      meterId: row.meter_id,
      readingDate: row.reading_date,
      previousReading: parseFloat(row.previous_reading),
      currentReading: parseFloat(row.current_reading),
      unitsConsumed: parseFloat(row.units_consumed),
      totalCost: parseFloat(row.total_cost),
      meterPhotoUrl: row.meter_photo_url,
      rentTransactionId: row.rent_transaction_id,
      recordedBy: row.recorded_by,
      createdAt: row.created_at
    };
  }
}
