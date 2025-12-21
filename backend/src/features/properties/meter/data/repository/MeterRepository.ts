import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository.js';
import { IMeterRepository } from '../../core/interfaces/IMeterRepository.js';
import { Meter, MeterInput } from '../../core/types/meter.types.js';
import { MeterMapper } from '../mappers/MeterMapper.js';

export class MeterRepository extends BaseRepository<Meter, MeterInput> implements IMeterRepository {
  constructor(pool: Pool) {
    super(pool, 'meters');
  }

  protected override mapToDomain(row: any): Meter {
    return MeterMapper.toDomain(row);
  }

  async create(data: MeterInput): Promise<Meter> {
    return super.add(data);
  }

  async update(id: string, data: Partial<MeterInput>): Promise<Meter | null> {
    return super.updateById(id, data);
  }

  async findByUnit(unitId: string): Promise<Meter[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE unit_id = $1`;
    const result = await this.pool.query(query, [unitId]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findByProperty(propertyId: string): Promise<Meter[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE property_id = $1`;
    const result = await this.pool.query(query, [propertyId]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findActiveByUnit(unitId: string): Promise<Meter[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE unit_id = $1 AND is_active = true`;
    const result = await this.pool.query(query, [unitId]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async updateStatus(id: string, isActive: boolean): Promise<boolean> {
    const query = `UPDATE ${this.tableName} SET is_active = $1, updated_at = NOW() WHERE id = $2`;
    const result = await this.pool.query(query, [isActive, id]);
    return (result.rowCount ?? 0) > 0;
  }
}
