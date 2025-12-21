import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository.js';
import { IPropertyRepository } from '../../core/interfaces/IPropertyRepository.js';
import { Property, PropertyInput } from '../../core/types/property.types.js';
import { PropertyMapper } from '../mappers/PropertyMapper.js';
import { IPropertyRow } from '../interfaces/IPropertyRow.js';

export class PropertyRepository extends BaseRepository<Property, PropertyInput> implements IPropertyRepository {
  constructor(pool: Pool) {
    super(pool, 'properties');
  }

  protected override mapToDomain(row: any): Property {
    return PropertyMapper.toDomain(row as IPropertyRow);
  }

  async findByOwner(ownerId: string): Promise<Property[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE owner_id = $1`;
    const result = await this.pool.query(query, [ownerId]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  override async create(data: PropertyInput): Promise<Property> {
    const id = uuidv4();
    const now = new Date();
    
    const propertyInput: any = { ...data, id, createdAt: now, updatedAt: now };
    const row = PropertyMapper.toPersistence(propertyInput);
    
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

  override async update(id: string, data: Partial<PropertyInput>): Promise<Property | null> {
    const propertyInput: any = { ...data, updatedAt: new Date() };
    const row = PropertyMapper.toPersistence(propertyInput);
    
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
