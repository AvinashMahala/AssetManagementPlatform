import { Pool } from 'pg';
import { IPropertyFileRepository } from '../../core/interfaces/IPropertyFileRepository';
import { PropertyFile } from '../../core/types/property.types';

export class PropertyFileRepository implements IPropertyFileRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(fileData: Omit<PropertyFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyFile> {
    try {
      const query = `
        INSERT INTO property_files (
          property_id, file_name, file_id, file_type, description, uploaded_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        fileData.propertyId,
        fileData.fileName,
        fileData.fileId,
        fileData.fileType,
        fileData.description,
        fileData.uploadedAt
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToPropertyFile(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create property file: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async getByPropertyId(propertyId: string): Promise<PropertyFile[]> {
    try {
      const query = `
        SELECT * FROM property_files
        WHERE property_id = $1
        ORDER BY uploaded_at DESC
      `;

      const result = await this.pool.query(query, [propertyId]);
      return result.rows.map(row => this.mapRowToPropertyFile(row));
    } catch (error) {
      throw new Error(`Failed to get property files: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getByPropertyIdAndType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]> {
    try {
      const query = `
        SELECT * FROM property_files
        WHERE property_id = $1 AND file_type = $2
        ORDER BY uploaded_at DESC
      `;

      const result = await this.pool.query(query, [propertyId, fileType]);
      return result.rows.map(row => this.mapRowToPropertyFile(row));
    } catch (error) {
      throw new Error(`Failed to get property files by type: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async getById(id: string): Promise<PropertyFile | null> {
    try {
      const query = `SELECT * FROM property_files WHERE id = $1`;
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToPropertyFile(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to get property file: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async update(id: string, updates: Partial<Pick<PropertyFile, 'fileName' | 'description'>>): Promise<PropertyFile | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.fileName !== undefined) {
        setClause.push(`file_name = $${paramIndex++}`);
        values.push(updates.fileName);
      }

      if (updates.description !== undefined) {
        setClause.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }

      if (setClause.length === 0) {
        return this.getById(id);
      }

      values.push(id);
      const query = `
        UPDATE property_files
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPropertyFile(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update property file: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM property_files WHERE id = $1`;
      const result = await this.pool.query(query, [id]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete property file: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async deleteByPropertyId(propertyId: string): Promise<number> {
    try {
      const query = `DELETE FROM property_files WHERE property_id = $1`;
      const result = await this.pool.query(query, [propertyId]);
      return result.rowCount ?? 0;
    } catch (error) {
      throw new Error(`Failed to delete property files: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  private mapRowToPropertyFile(row: any): PropertyFile {
    return {
      id: row.id,
      propertyId: row.property_id,
      fileId: row.file_id,
      fileName: row.file_name,
      fileType: row.file_type,
      description: row.description,
      uploadedAt: row.uploaded_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
