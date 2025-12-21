import { Pool } from 'pg';
import { MeterReading, MeterReadingInput, MeterTrendData, MeterStatistics } from '../models/Meter.js';
import { TABLES, COLUMNS } from '@/shared/constants/database.js';
import { IMeterReadingRepository } from '../interfaces/repositories/IMeterRepository.js';

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
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.ID} = $1`,
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
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1 ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC`,
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
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1 AND ${COLUMNS.METER_READINGS.READING_DATE} BETWEEN $2 AND $3 ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC`,
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
        `SELECT * FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1 ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC LIMIT 1`,
        [meterId]
      );
      return result.rows[0] ? this.mapRowToMeterReading(result.rows[0]) : null;
    } catch (error) {
      throw new Error('Failed to fetch latest meter reading');
    }
  }

  async create(data: Omit<MeterReading, 'id' | 'unitsConsumed' | 'totalCost' | 'createdAt'>): Promise<MeterReading> {
    try {
      // Get meter details for cost calculation
      const meterResult = await this.pool.query(
        `SELECT ${COLUMNS.METERS.COST_PER_UNIT}, ${COLUMNS.METERS.FIXED_CHARGE} FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.ID} = $1`,
        [data.meterId]
      );

      if (meterResult.rows.length === 0) {
        throw new Error('Meter not found');
      }

      const meter = meterResult.rows[0];
      const costPerUnit = parseFloat(meter.cost_per_unit) || 0;
      const fixedCharge = meter.fixed_charge ? parseFloat(meter.fixed_charge) : 0;

      // Calculate units consumed and total cost
      const unitsConsumed = data.currentReading - data.previousReading;
      const totalCost = (unitsConsumed * costPerUnit) + fixedCharge;

      const result = await this.pool.query(
        `INSERT INTO ${TABLES.METER_READINGS} (
          ${COLUMNS.METER_READINGS.ID},
          ${COLUMNS.METER_READINGS.METER_ID},
          ${COLUMNS.METER_READINGS.READING_DATE},
          ${COLUMNS.METER_READINGS.PREVIOUS_READING},
          ${COLUMNS.METER_READINGS.CURRENT_READING},
          ${COLUMNS.METER_READINGS.UNITS_CONSUMED},
          ${COLUMNS.METER_READINGS.TOTAL_COST},
          ${COLUMNS.METER_READINGS.METER_PHOTO_URL},
          ${COLUMNS.METER_READINGS.RENT_TRANSACTION_ID},
          ${COLUMNS.METER_READINGS.RECORDED_BY},
          ${COLUMNS.METER_READINGS.CREATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          crypto.randomUUID(),
          data.meterId,
          data.readingDate,
          data.previousReading,
          data.currentReading,
          unitsConsumed,
          totalCost,
          data.meterPhotoUrl,
          data.rentTransactionId,
          data.recordedBy,
          new Date()
        ]
      );
      return this.mapRowToMeterReading(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create meter reading: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async update(id: string, data: Partial<Omit<MeterReading, 'id' | 'createdAt'>>): Promise<MeterReading | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.meterId !== undefined) {
        fields.push(`${COLUMNS.METER_READINGS.METER_ID} = $${paramIndex++}`);
        values.push(data.meterId);
      }
      if (data.readingDate !== undefined) {
        fields.push(`${COLUMNS.METER_READINGS.READING_DATE} = $${paramIndex++}`);
        values.push(data.readingDate);
      }
      if (data.previousReading !== undefined) {
        fields.push(`${COLUMNS.METER_READINGS.PREVIOUS_READING} = $${paramIndex++}`);
        values.push(data.previousReading);
      }
      if (data.currentReading !== undefined) {
        fields.push(`${COLUMNS.METER_READINGS.CURRENT_READING} = $${paramIndex++}`);
        values.push(data.currentReading);
      }
      if (data.meterPhotoUrl !== undefined) {
        fields.push(`${COLUMNS.METER_READINGS.METER_PHOTO_URL} = $${paramIndex++}`);
        values.push(data.meterPhotoUrl);
      }
      if (data.rentTransactionId !== undefined) {
        fields.push(`${COLUMNS.METER_READINGS.RENT_TRANSACTION_ID} = $${paramIndex++}`);
        values.push(data.rentTransactionId);
      }
      if (data.recordedBy !== undefined) {
        fields.push(`${COLUMNS.METER_READINGS.RECORDED_BY} = $${paramIndex++}`);
        values.push(data.recordedBy);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.METER_READINGS} SET ${setClause} WHERE ${COLUMNS.METER_READINGS.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);

      // Recalculate units consumed and total cost if readings changed
      if (data.previousReading !== undefined || data.currentReading !== undefined) {
        await this.recalculateReading(result.rows[0].id);
      }

      return result.rows[0] ? this.mapRowToMeterReading(result.rows[0]) : null;
    } catch (error) {
      throw new Error(`Failed to update meter reading: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to delete meter reading');
    }
  }

  async getTrendData(meterId: string, months: number = 6): Promise<MeterTrendData[]> {
    try {
      const result = await this.pool.query(
        `SELECT
          TO_CHAR(${COLUMNS.METER_READINGS.READING_DATE}, 'YYYY-MM') as month,
          SUM(${COLUMNS.METER_READINGS.UNITS_CONSUMED}) as units_consumed,
          SUM(${COLUMNS.METER_READINGS.TOTAL_COST}) as total_cost,
          MAX(${COLUMNS.METER_READINGS.READING_DATE}) as reading_date
        FROM ${TABLES.METER_READINGS}
        WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1
          AND ${COLUMNS.METER_READINGS.READING_DATE} >= CURRENT_DATE - INTERVAL '${months} months'
        GROUP BY TO_CHAR(${COLUMNS.METER_READINGS.READING_DATE}, 'YYYY-MM')
        ORDER BY month DESC`,
        [meterId]
      );

      return result.rows.map(row => ({
        month: row.month,
        unitsConsumed: parseFloat(row.units_consumed) || 0,
        totalCost: parseFloat(row.total_cost) || 0,
        readingDate: new Date(row.reading_date)
      }));
    } catch (error) {
      throw new Error('Failed to get trend data');
    }
  }

  async getStatistics(meterId: string): Promise<MeterStatistics | null> {
    try {
      // Get meter details
      const meterResult = await this.pool.query(
        `SELECT ${COLUMNS.METERS.METER_NAME}, ${COLUMNS.METERS.METER_TYPE} FROM ${TABLES.METERS} WHERE ${COLUMNS.METERS.ID} = $1`,
        [meterId]
      );

      if (meterResult.rows.length === 0) {
        return null;
      }

      const meter = meterResult.rows[0];

      // Get reading statistics
      const statsResult = await this.pool.query(
        `SELECT
          COUNT(*) as total_readings,
          AVG(${COLUMNS.METER_READINGS.UNITS_CONSUMED}) as avg_units,
          AVG(${COLUMNS.METER_READINGS.TOTAL_COST}) as avg_cost,
          MAX(${COLUMNS.METER_READINGS.READING_DATE}) as last_reading_date,
          (SELECT ${COLUMNS.METER_READINGS.UNITS_CONSUMED} FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1 ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC LIMIT 1) as last_units,
          (SELECT ${COLUMNS.METER_READINGS.TOTAL_COST} FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1 ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC LIMIT 1) as last_cost,
          (SELECT ${COLUMNS.METER_READINGS.UNITS_CONSUMED} FROM ${TABLES.METER_READINGS} WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1 ORDER BY ${COLUMNS.METER_READINGS.READING_DATE} DESC LIMIT 1 OFFSET 1) as prev_units
        FROM ${TABLES.METER_READINGS}
        WHERE ${COLUMNS.METER_READINGS.METER_ID} = $1
          AND ${COLUMNS.METER_READINGS.READING_DATE} >= CURRENT_DATE - INTERVAL '6 months'`,
        [meterId]
      );

      const stats = statsResult.rows[0];
      const totalReadings = parseInt(stats.total_readings) || 0;
      const avgUnits = parseFloat(stats.avg_units) || 0;
      const lastUnits = parseFloat(stats.last_units) || 0;
      const prevUnits = parseFloat(stats.prev_units) || 0;

      // Calculate trend
      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (prevUnits > 0) {
        const change = ((lastUnits - prevUnits) / prevUnits) * 100;
        if (change > 5) trendDirection = 'up';
        else if (change < -5) trendDirection = 'down';
      }

      return {
        meterId,
        meterName: meter.meter_name,
        meterType: meter.meter_type,
        totalReadings,
        averageUnitsConsumed: avgUnits,
        averageCost: parseFloat(stats.avg_cost) || 0,
        lastReadingDate: stats.last_reading_date ? new Date(stats.last_reading_date) : undefined,
        lastUnitsConsumed: lastUnits || undefined,
        lastCost: parseFloat(stats.last_cost) || undefined,
        differenceFromAverage: totalReadings > 0 ? lastUnits - avgUnits : 0,
        differenceFromLastMonth: prevUnits > 0 ? lastUnits - prevUnits : 0,
        trendDirection
      };
    } catch (error) {
      throw new Error('Failed to get meter statistics');
    }
  }

  private async recalculateReading(readingId: string): Promise<void> {
    try {
      // Get the reading and meter details
      const readingResult = await this.pool.query(
        `SELECT mr.*, m.${COLUMNS.METERS.COST_PER_UNIT}, m.${COLUMNS.METERS.FIXED_CHARGE}
         FROM ${TABLES.METER_READINGS} mr
         JOIN ${TABLES.METERS} m ON mr.${COLUMNS.METER_READINGS.METER_ID} = m.${COLUMNS.METERS.ID}
         WHERE mr.${COLUMNS.METER_READINGS.ID} = $1`,
        [readingId]
      );

      if (readingResult.rows.length === 0) {
        return;
      }

      const row = readingResult.rows[0];
      const costPerUnit = parseFloat(row.cost_per_unit) || 0;
      const fixedCharge = row.fixed_charge ? parseFloat(row.fixed_charge) : 0;

      const unitsConsumed = row.current_reading - row.previous_reading;
      const totalCost = (unitsConsumed * costPerUnit) + fixedCharge;

      // Update the calculated fields
      await this.pool.query(
        `UPDATE ${TABLES.METER_READINGS}
         SET ${COLUMNS.METER_READINGS.UNITS_CONSUMED} = $1, ${COLUMNS.METER_READINGS.TOTAL_COST} = $2
         WHERE ${COLUMNS.METER_READINGS.ID} = $3`,
        [unitsConsumed, totalCost, readingId]
      );
    } catch (error) {
      console.error('Failed to recalculate reading:', error);
    }
  }

  private mapRowToMeterReading(row: any): MeterReading {
    return {
      id: row.id,
      meterId: row.meter_id,
      readingDate: new Date(row.reading_date),
      previousReading: parseFloat(row.previous_reading) || 0,
      currentReading: parseFloat(row.current_reading) || 0,
      unitsConsumed: parseFloat(row.units_consumed) || 0,
      totalCost: parseFloat(row.total_cost) || 0,
      meterPhotoUrl: row.meter_photo_url,
      rentTransactionId: row.rent_transaction_id,
      recordedBy: row.recorded_by,
      createdAt: new Date(row.created_at),
    };
  }
}