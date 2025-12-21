import { Pool } from 'pg';
import { TABLES, COLUMNS } from '@/shared/constants/database';

export interface RentTransactionMeterReading {
  id: string;
  transactionId: string;
  meterId: string;
  meterReadingId?: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  costPerUnit: number;
  fixedCharge: number;
  totalCost: number;
  createdAt: Date;
}

export interface RentTransactionMeterReadingInput {
  transactionId: string;
  meterId: string;
  meterReadingId?: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  costPerUnit: number;
  fixedCharge: number;
  totalCost: number;
}

export interface IRentTransactionMeterReadingRepository {
  findByTransaction(transactionId: string): Promise<RentTransactionMeterReading[]>;
  findByMeter(meterId: string): Promise<RentTransactionMeterReading[]>;
  create(data: RentTransactionMeterReadingInput): Promise<RentTransactionMeterReading>;
  createBatch(data: RentTransactionMeterReadingInput[]): Promise<RentTransactionMeterReading[]>;
  deleteByTransaction(transactionId: string): Promise<boolean>;
}

export class RentTransactionMeterReadingRepository implements IRentTransactionMeterReadingRepository {
  constructor(private pool: Pool) {}

  async findByTransaction(transactionId: string): Promise<RentTransactionMeterReading[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTION_METER_READINGS} WHERE transaction_id = $1 ORDER BY created_at`,
        [transactionId]
      );
      return result.rows.map(row => this.mapRowToMeterReading(row));
    } catch (error) {
      throw new Error(`Failed to find meter readings by transaction: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async findByMeter(meterId: string): Promise<RentTransactionMeterReading[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.RENT_TRANSACTION_METER_READINGS} WHERE meter_id = $1 ORDER BY created_at DESC`,
        [meterId]
      );
      return result.rows.map(row => this.mapRowToMeterReading(row));
    } catch (error) {
      throw new Error(`Failed to find meter readings by meter: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async create(data: RentTransactionMeterReadingInput): Promise<RentTransactionMeterReading> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.RENT_TRANSACTION_METER_READINGS} (
          transaction_id,
          meter_id,
          meter_reading_id,
          previous_reading,
          current_reading,
          units_consumed,
          cost_per_unit,
          fixed_charge,
          total_cost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          data.transactionId,
          data.meterId,
          data.meterReadingId || null,
          data.previousReading,
          data.currentReading,
          data.unitsConsumed,
          data.costPerUnit,
          data.fixedCharge,
          data.totalCost
        ]
      );
      return this.mapRowToMeterReading(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create transaction meter reading: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async createBatch(data: RentTransactionMeterReadingInput[]): Promise<RentTransactionMeterReading[]> {
    if (data.length === 0) {
      return [];
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const results: RentTransactionMeterReading[] = [];
      for (const item of data) {
        const result = await client.query(
          `INSERT INTO ${TABLES.RENT_TRANSACTION_METER_READINGS} (
            transaction_id,
            meter_id,
            meter_reading_id,
            previous_reading,
            current_reading,
            units_consumed,
            cost_per_unit,
            fixed_charge,
            total_cost
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *`,
          [
            item.transactionId,
            item.meterId,
            item.meterReadingId || null,
            item.previousReading,
            item.currentReading,
            item.unitsConsumed,
            item.costPerUnit,
            item.fixedCharge,
            item.totalCost
          ]
        );
        results.push(this.mapRowToMeterReading(result.rows[0]));
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to create batch transaction meter readings: ${(error as Error).message || 'Database batch insert failed'}`);
    } finally {
      client.release();
    }
  }

  async deleteByTransaction(transactionId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.RENT_TRANSACTION_METER_READINGS} WHERE transaction_id = $1`,
        [transactionId]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      throw new Error(`Failed to delete transaction meter readings: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  private mapRowToMeterReading(row: any): RentTransactionMeterReading {
    return {
      id: row.id,
      transactionId: row.transaction_id,
      meterId: row.meter_id,
      meterReadingId: row.meter_reading_id,
      previousReading: parseFloat(row.previous_reading),
      currentReading: parseFloat(row.current_reading),
      unitsConsumed: parseFloat(row.units_consumed),
      costPerUnit: parseFloat(row.cost_per_unit),
      fixedCharge: parseFloat(row.fixed_charge || 0),
      totalCost: parseFloat(row.total_cost),
      createdAt: row.created_at
    };
  }
}
