import { Pool } from 'pg';
import { PropertyFile } from '@/models/Property';
import { IPropertyFileRepository } from '@/interfaces/repositories/IPropertyFileRepository';

export class PropertyFileRepository implements IPropertyFileRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
  /**
   * Create a new property file record
   */
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

  /**
   * Get all files for a property
   */
  async getByPropertyId(propertyId: string): Promise<PropertyFile[]> {
    try {
      const query = `
        SELECT * FROM property_files
        WHERE property_id = $1
        ORDER BY uploaded_at DESC
      `;

      const result = await this.pool.query(query, [propertyId]);
      return result.rows.map((row: any) => this.mapRowToPropertyFile(row));
    } catch (error) {
      throw new Error(`Failed to get property files by property ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  /**
   * Get files by type for a property
   */
  async getByPropertyIdAndType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]> {
    try {
      const query = `
        SELECT * FROM property_files
        WHERE property_id = $1 AND file_type = $2
        ORDER BY uploaded_at DESC
      `;

      const result = await this.pool.query(query, [propertyId, fileType]);
      return result.rows.map((row: any) => this.mapRowToPropertyFile(row));
    } catch (error) {
      throw new Error(`Failed to get property files by property ID and type: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  /**
   * Get file by ID
   */
  async getById(id: string): Promise<PropertyFile | null> {
    try {
      const query = `SELECT * FROM property_files WHERE id = $1`;

      const result = await this.pool.query(query, [id]);
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPropertyFile(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to get property file by ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  /**
   * Update file information
   */
  async update(id: string, updates: Partial<Pick<PropertyFile, 'fileName' | 'description'>>): Promise<PropertyFile | null> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.fileName !== undefined) {
        setParts.push(`file_name = $${paramIndex++}`);
        values.push(updates.fileName);
      }

      if (updates.description !== undefined) {
        setParts.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }

      if (setParts.length === 0) {
        return null;
      }

      const query = `
        UPDATE property_files
        SET ${setParts.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      values.push(id);

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPropertyFile(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update property file: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  /**
   * Delete a file record
   */
  async delete(id: string): Promise<boolean> {
    try {
      const query = `DELETE FROM property_files WHERE id = $1 RETURNING id`;

      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete property file: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  /**
   * Delete all files for a property
   */
  async deleteByPropertyId(propertyId: string): Promise<number> {
    try {
      const query = `DELETE FROM property_files WHERE property_id = $1`;

      const result = await this.pool.query(query, [propertyId]);
      return result.rowCount || 0;
    } catch (error) {
      throw new Error(`Failed to delete property files by property ID: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  /**
   * Map database row to PropertyFile object
   */
  private mapRowToPropertyFile(row: any): PropertyFile {
    return {
      id: row.id,
      propertyId: row.property_id,
      fileName: row.file_name,
      fileId: row.file_id,
      fileType: row.file_type,
      description: row.description,
      uploadedAt: new Date(row.uploaded_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}