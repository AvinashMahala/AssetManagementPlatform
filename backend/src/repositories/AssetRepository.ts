import { Pool } from 'pg';
import { Asset } from '../models/Asset.js';
import { TABLES, COLUMNS } from '../constants/database.js';
import { IAssetRepository } from '../interfaces/repositories/IAssetRepository.js';

export class AssetRepository implements IAssetRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Asset[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.ASSETS}`);
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch assets');
    }
  }

  async findById(id: number): Promise<Asset | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.ASSETS} WHERE ${COLUMNS.ASSETS.ID} = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch asset');
    }
  }

  async create(data: Omit<Asset, 'id'>): Promise<Asset> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.ASSETS} (${COLUMNS.ASSETS.NAME}, ${COLUMNS.ASSETS.DESCRIPTION}, ${COLUMNS.ASSETS.VALUE}, ${COLUMNS.ASSETS.LOCATION}) VALUES ($1, $2, $3, $4) RETURNING *`,
        [data.name, data.description, data.value, data.location]
      );
      return result.rows[0];
    } catch (error) {
      throw error; // Let the service layer handle database-specific errors
    }
  }

  async update(id: number, data: Partial<Omit<Asset, 'id'>>): Promise<Asset | null> {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
      const query = `UPDATE ${TABLES.ASSETS} SET ${setClause} WHERE ${COLUMNS.ASSETS.ID} = $${fields.length + 1} RETURNING *`;
      values.push(id);
      const result = await this.pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.ASSETS} WHERE ${COLUMNS.ASSETS.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error('Failed to delete asset');
    }
  }
}