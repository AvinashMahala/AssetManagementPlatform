import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { FileMetadata, FileRecord } from '../core/file-storage.types';

interface FileMetadataRow {
  id: string;
  entityType: string | null;
  entityId: string | null;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: Date;
  lastAccessed: Date | null;
  version: number;
  total_count?: number;
}

export class FileStorageRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * 001. List files (paginated)
   * @param options Pagination and filter options
   * @return Paginated list of file metadata
   */
  async listFiles(options: { limit?: number; offset?: number; entityType?: string | null; entityId?: string | null }) {
    const { limit = 20, offset = 0, entityType = null, entityId = null } = options;

    const params: Array<string | number | null> = [];
    let whereClauses: string[] = [];

    if (entityType) {
      params.push(entityType);
      whereClauses.push(`entity_type = $${params.length}`);
    }

    if (entityId) {
      params.push(entityId);
      whereClauses.push(`entity_id = $${params.length}`);
    }

    // Add pagination params
    params.push(limit);
    params.push(offset);

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const result = await this.pool.query(
      `SELECT id, entity_type as "entityType", entity_id as "entityId", filename, original_name as "originalName", file_size as "fileSize", mime_type as "mimeType", category, tags, uploaded_by as "uploadedBy", uploaded_at as "uploadedAt", last_accessed as "lastAccessed", version, COUNT(*) OVER() as total_count
       FROM file_metadata
       ${where}
       ORDER BY uploaded_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    const items = result.rows.map((r: FileMetadataRow) => ({
      id: r.id,
      entityType: r.entityType,
      entityId: r.entityId,
      filename: r.filename,
      originalName: r.originalName,
      fileSize: r.fileSize,
      mimeType: r.mimeType,
      category: r.category,
      tags: r.tags,
      uploadedBy: r.uploadedBy,
      uploadedAt: r.uploadedAt,
      lastAccessed: r.lastAccessed,
      version: r.version
    }));

    const total = result.rows.length > 0 ? Number(result.rows[0].total_count) : 0;

    return { items, total };
  }

  /**
   * 002. Upload a single file
   * @param fileBuffer The file content as a Buffer
   * @param metadata Metadata associated with the file
   * @return The ID of the uploaded file
   */
  async uploadFile(fileBuffer: Buffer, metadata: FileMetadata): Promise<string> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Generate file hash for integrity
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Store metadata
      const fileId = uuidv4();
      await client.query(`
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
   * 003. Download a single file from storage
   * @param fileId The ID of the file to download
   * @param userId Optional user ID for access logging
   * @return The file content as a Buffer
   */
  async downloadFile(fileId: string, userId?: string): Promise<Buffer> {
    const client = await this.pool.connect();

    try {
      // Log access if userId is provided
      if (userId) {
        // Check if table exists or just try insert? Assuming it exists.
        // We might want to wrap this in try-catch so logging failure doesn't stop download
        try {
          await client.query(`
            INSERT INTO file_access_log (file_id, user_id, access_type)
            VALUES ($1, $2, 'download')
          `, [fileId, userId]);
        } catch (logError) {
          console.warn('Failed to log file access', logError);
        }
      }

      // Get all chunks ordered by chunk number
      const result = await client.query(`
        SELECT chunk_data 
        FROM file_content 
        WHERE metadata_id = $1 
        ORDER BY chunk_number ASC
      `, [fileId]);

      if (result.rows.length === 0) {
        throw new Error('File content not found');
      }

      // Combine chunks
      const chunks = result.rows.map(row => row.chunk_data);
      const fileBuffer = Buffer.concat(chunks);

      // Update last accessed time
      await client.query(`
        UPDATE file_metadata 
        SET last_accessed = NOW() 
        WHERE id = $1
      `, [fileId]);

      return fileBuffer;
    } finally {
      client.release();
    }
  }

  /**
   * 004. Get metadata for a single file
   * @param fileId The ID of the file
   * @return The file metadata or null if not found
   */
  async getFileMetadata(fileId: string): Promise<FileRecord | null> {
    const result = await this.pool.query(`
      SELECT 
        id, entity_type as "entityType", entity_id as "entityId", 
        filename, original_name as "originalName", file_size as "fileSize",
        mime_type as "mimeType", file_hash as "fileHash", 
        category, tags, uploaded_by as "uploadedBy", 
        uploaded_at as "uploadedAt", last_accessed as "lastAccessed", version
      FROM file_metadata
      WHERE id = $1
    `, [fileId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * 005. Delete a single file
   * @param fileId The ID of the file to delete
   * @return True if deletion was successful, false otherwise
   */
  async deleteFile(fileId: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      // Delete content first (foreign key constraint usually handles this if cascade is on, but being safe)
      await client.query('DELETE FROM file_content WHERE metadata_id = $1', [fileId]);
      
      // Delete metadata
      const result = await client.query('DELETE FROM file_metadata WHERE id = $1', [fileId]);

      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Helper Methods listed below
  // ------------------------------------------------
  /**
   * Helper method to chunk a buffer into smaller buffers
   * @param buffer The buffer to be chunked
   * @param chunkSize Size of each chunk in bytes
   * @returns Array of buffer chunks
   */
  private chunkBuffer(buffer: Buffer, chunkSize: number): Buffer[] {
    const chunks: Buffer[] = [];
    let i = 0;
    while (i < buffer.length) {
      chunks.push(buffer.slice(i, i + chunkSize));
      i += chunkSize;
    }
    return chunks;
  }
}
