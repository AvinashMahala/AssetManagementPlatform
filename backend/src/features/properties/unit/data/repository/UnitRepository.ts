import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository.js';
import { IUnitRepository } from '../../core/interfaces/IUnitRepository.js';
import { Unit, UnitInput } from '../../core/types/unit.types.js';
import { UnitMapper } from '../mappers/UnitMapper.js';
import { IUnitRow } from '../interfaces/IUnitRow.js';

export class UnitRepository extends BaseRepository<Unit, UnitInput> implements IUnitRepository {
  constructor(pool: Pool) {
    super(pool, 'units');
  }

  protected override mapToDomain(row: any): Unit {
    return UnitMapper.toDomain(row as IUnitRow);
  }

  async findByProperty(propertyId: string): Promise<Unit[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE property_id = $1`;
    const result = await this.pool.query(query, [propertyId]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async findByStatus(status: string): Promise<Unit[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = $1`;
    const result = await this.pool.query(query, [status]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async create(data: UnitInput): Promise<Unit> {
    const id = uuidv4();
    const now = new Date();
    
    const unitInput: any = { ...data, id, createdAt: now, updatedAt: now };
    const row = UnitMapper.toPersistence(unitInput);
    
    const keys = Object.keys(row);
    const values = Object.values(row);
    
    const columns = keys.join(', ');
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${columns}) 
      VALUES (${placeholders}) 
      RETURNING *
    `;
    
    const result = await this.pool.query(query, values);
    return this.mapToDomain(result.rows[0]);
  }

  async update(id: string, data: Partial<UnitInput>): Promise<Unit | null> {
    const unitInput: any = { ...data, updatedAt: new Date() };
    const row = UnitMapper.toPersistence(unitInput);
    
    const keys = Object.keys(row);
    const values = Object.values(row);
    
    if (keys.length === 0) return this.findById(id);

    const setClause = keys
      .map((k, i) => `${k} = $${i + 2}`)
      .join(', ');

    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.pool.query(query, [id, ...values]);
    return result.rows[0] ? this.mapToDomain(result.rows[0]) : null;
  }
}
