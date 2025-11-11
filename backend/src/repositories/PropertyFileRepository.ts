import { Pool } from 'pg';
import { PropertyFile } from '../models/Property';
import { IPropertyFileRepository } from '../interfaces/repositories/IPropertyFileRepository';

export class PropertyFileRepository implements IPropertyFileRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }
  /**
   * Create a new property file record
   */
  async create(fileData: Omit<PropertyFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyFile> {
    const query = `
      INSERT INTO property_files (
        property_id, file_name, file_url, file_type, description, uploaded_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      fileData.propertyId,
      fileData.fileName,
      fileData.fileUrl,
      fileData.fileType,
      fileData.description,
      fileData.uploadedAt
    ];

    const result = await this.pool.query(query, values);
    return this.mapRowToPropertyFile(result.rows[0]);
  }

  /**
   * Get all files for a property
   */
  async getByPropertyId(propertyId: string): Promise<PropertyFile[]> {
    const query = `
      SELECT * FROM property_files
      WHERE property_id = $1
      ORDER BY uploaded_at DESC
    `;

    const result = await this.pool.query(query, [propertyId]);
    return result.rows.map((row: any) => this.mapRowToPropertyFile(row));
  }

  /**
   * Get files by type for a property
   */
  async getByPropertyIdAndType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]> {
    const query = `
      SELECT * FROM property_files
      WHERE property_id = $1 AND file_type = $2
      ORDER BY uploaded_at DESC
    `;

    const result = await this.pool.query(query, [propertyId, fileType]);
    return result.rows.map((row: any) => this.mapRowToPropertyFile(row));
  }

  /**
   * Get file by ID
   */
  async getById(id: string): Promise<PropertyFile | null> {
    const query = `SELECT * FROM property_files WHERE id = $1`;

    const result = await this.pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPropertyFile(result.rows[0]);
  }

  /**
   * Update file information
   */
  async update(id: string, updates: Partial<Pick<PropertyFile, 'fileName' | 'description'>>): Promise<PropertyFile | null> {
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
  }

  /**
   * Delete a file record
   */
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM property_files WHERE id = $1 RETURNING id`;

    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Delete all files for a property
   */
  async deleteByPropertyId(propertyId: string): Promise<number> {
    const query = `DELETE FROM property_files WHERE property_id = $1`;

    const result = await this.pool.query(query, [propertyId]);
    return result.rowCount || 0;
  }

  /**
   * Map database row to PropertyFile object
   */
  private mapRowToPropertyFile(row: any): PropertyFile {
    return {
      id: row.id,
      propertyId: row.property_id,
      fileName: row.file_name,
      fileUrl: row.file_url,
      fileType: row.file_type,
      description: row.description,
      uploadedAt: new Date(row.uploaded_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}