import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export interface FileMetadata {
  entityType?: string; // Optional for general files
  entityId?: string; // Optional for general files
  filename: string;
  originalName: string;
  mimeType: string;
  category?: string;
  tags?: string[];
  uploadedBy: string | null;
}

export interface FileRecord {
  id: string;
  entityType?: string; // Optional for general files
  entityId?: string; // Optional for general files
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;
  category?: string;
  tags?: string[];
  uploadedBy: string | null;
  uploadedAt: Date;
  lastAccessed?: Date;
  version: number;
}

export class FileStorageService {
  constructor(
    private mainPool: Pool,
    private filesPool: Pool
  ) {}

  /**
   * Upload a file to the storage system
   */
  async uploadFile(fileBuffer: Buffer, metadata: FileMetadata): Promise<string> {
    const client = await this.filesPool.connect();

    try {
      await client.query('BEGIN');

      // Generate file hash for integrity
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Store metadata
      const fileId = uuidv4();
      const metadataResult = await client.query(`
        INSERT INTO file_metadata (
          id, entity_type, entity_id, filename, original_name, file_size,
          mime_type, file_hash, category, tags, uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [
        fileId,
        metadata.entityType || null,
        metadata.entityId || null,
        metadata.filename,
        metadata.originalName,
        fileBuffer.length,
        metadata.mimeType,
        fileHash,
        metadata.category || 'document',
        metadata.tags || [],
        metadata.uploadedBy
      ]);

      // Store file content (chunked for large files)
      const chunks = this.chunkBuffer(fileBuffer, 1024 * 1024); // 1MB chunks

      for (let i = 0; i < chunks.length; i++) {
        await client.query(`
          INSERT INTO file_content (metadata_id, chunk_number, chunk_data, chunk_size)
          VALUES ($1, $2, $3, $4)
        `, [fileId, i, chunks[i], chunks[i].length]);
      }

      await client.query('COMMIT');
      return fileId;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Download a file from storage
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    const client = await this.filesPool.connect();

    try {
      // Log access
      await client.query(`
        INSERT INTO file_access_log (file_id, user_id, access_type)
        VALUES ($1, $2, 'download')
      `, [fileId, null]); // TODO: Get from context

      // Update last accessed
      await client.query(`
        UPDATE file_metadata
        SET last_accessed = NOW()
        WHERE id = $1
      `, [fileId]);

      // Get file chunks
      const result = await client.query(`
        SELECT chunk_data
        FROM file_content
        WHERE metadata_id = $1
        ORDER BY chunk_number
      `, [fileId]);

      // Combine chunks
      const chunks = result.rows.map(row => row.chunk_data);
      return Buffer.concat(chunks);

    } finally {
      client.release();
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileRecord | null> {
    const client = await this.filesPool.connect();

    try {
      const result = await client.query(`
        SELECT id, entity_type, entity_id, filename, original_name, file_size,
               mime_type, file_hash, category, tags, uploaded_by, uploaded_at,
               last_accessed, version
        FROM file_metadata
        WHERE id = $1 AND is_deleted = FALSE
      `, [fileId]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        filename: row.filename,
        originalName: row.original_name,
        fileSize: parseInt(row.file_size),
        mimeType: row.mime_type,
        fileHash: row.file_hash,
        category: row.category,
        tags: row.tags,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
        lastAccessed: row.last_accessed,
        version: parseInt(row.version)
      };

    } finally {
      client.release();
    }
  }

  /**
   * List files for an entity
   */
  async listEntityFiles(entityType: string, entityId: string): Promise<FileRecord[]> {
    const client = await this.filesPool.connect();

    try {
      const result = await client.query(`
        SELECT id, entity_type, entity_id, filename, original_name, file_size,
               mime_type, file_hash, category, tags, uploaded_by, uploaded_at,
               last_accessed, version
        FROM file_metadata
        WHERE entity_type = $1 AND entity_id = $2 AND is_deleted = FALSE
        ORDER BY uploaded_at DESC
      `, [entityType, entityId]);

      return result.rows.map(row => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        filename: row.filename,
        originalName: row.original_name,
        fileSize: parseInt(row.file_size),
        mimeType: row.mime_type,
        fileHash: row.file_hash,
        category: row.category,
        tags: row.tags,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
        lastAccessed: row.last_accessed,
        version: parseInt(row.version)
      }));

    } finally {
      client.release();
    }
  }

  /**
   * Delete a file (soft delete)
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const client = await this.filesPool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(`
        UPDATE file_metadata
        SET is_deleted = TRUE, deleted_at = NOW()
        WHERE id = $1 AND is_deleted = FALSE
      `, [fileId]);

      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    filesByType: Record<string, number>;
    filesByCategory: Record<string, number>;
  }> {
    const client = await this.filesPool.connect();

    try {
      // Total files and size
      const totalResult = await client.query(`
        SELECT COUNT(*) as total_files, COALESCE(SUM(file_size), 0) as total_size
        FROM file_metadata
        WHERE is_deleted = FALSE
      `);

      // Files by type
      const typeResult = await client.query(`
        SELECT mime_type, COUNT(*) as count
        FROM file_metadata
        WHERE is_deleted = FALSE
        GROUP BY mime_type
      `);

      // Files by category
      const categoryResult = await client.query(`
        SELECT category, COUNT(*) as count
        FROM file_metadata
        WHERE is_deleted = FALSE
        GROUP BY category
      `);

      const filesByType: Record<string, number> = {};
      typeResult.rows.forEach(row => {
        filesByType[row.mime_type] = parseInt(row.count);
      });

      const filesByCategory: Record<string, number> = {};
      categoryResult.rows.forEach(row => {
        filesByCategory[row.category] = parseInt(row.count);
      });

      return {
        totalFiles: parseInt(totalResult.rows[0].total_files),
        totalSize: parseInt(totalResult.rows[0].total_size),
        filesByType,
        filesByCategory
      };

    } finally {
      client.release();
    }
  }

  /**
   * Chunk a buffer into smaller pieces
   */
  private chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    const chunks: Buffer[] = [];
    for (let i = 0; i < buffer.length; i += chunkSize) {
      chunks.push(buffer.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * List all files with optional filters
   */
  async listAllFiles(filters: {
    entityType?: string;
    category?: string;
    search?: string;
    limit: number;
    offset: number;
  }): Promise<{ files: FileRecord[]; total: number }> {
    const client = await this.filesPool.connect();

    try {
      // First, get the total count
      let countQuery = `
        SELECT COUNT(*) as total
        FROM file_metadata
        WHERE is_deleted = FALSE
      `;

      const countParams: any[] = [];
      const countConditions: string[] = [];

      if (filters.entityType) {
        countConditions.push(`entity_type = $${countParams.length + 1}`);
        countParams.push(filters.entityType);
      }

      if (filters.category) {
        countConditions.push(`category = $${countParams.length + 1}`);
        countParams.push(filters.category);
      }

      if (filters.search) {
        countConditions.push(`original_name ILIKE $${countParams.length + 1}`);
        countParams.push(`%${filters.search}%`);
      }

      if (countConditions.length > 0) {
        countQuery += ` AND ${countConditions.join(' AND ')}`;
      }

      const countResult = await client.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      // Then get the paginated results
      let query = `
        SELECT id, entity_type, entity_id, filename, original_name, file_size,
               mime_type, file_hash, category, tags, uploaded_by, uploaded_at,
               last_accessed, version
        FROM file_metadata
        WHERE is_deleted = FALSE
      `;

      const params: any[] = [];
      const conditions: string[] = [];

      if (filters.entityType) {
        conditions.push(`entity_type = $${params.length + 1}`);
        params.push(filters.entityType);
      }

      if (filters.category) {
        conditions.push(`category = $${params.length + 1}`);
        params.push(filters.category);
      }

      if (filters.search) {
        conditions.push(`original_name ILIKE $${params.length + 1}`);
        params.push(`%${filters.search}%`);
      }

      if (conditions.length > 0) {
        query += ` AND ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY uploaded_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(filters.limit, filters.offset);

      const result = await client.query(query, params);

      const files = result.rows.map(row => ({
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        filename: row.filename,
        originalName: row.original_name,
        fileSize: parseInt(row.file_size),
        mimeType: row.mime_type,
        fileHash: row.file_hash,
        category: row.category,
        tags: row.tags,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.uploaded_at,
        lastAccessed: row.last_accessed,
        version: parseInt(row.version)
      }));

      return { files, total };

    } finally {
      client.release();
    }
  }
}