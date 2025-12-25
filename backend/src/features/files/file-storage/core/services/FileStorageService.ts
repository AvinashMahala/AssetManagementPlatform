import { FileStorageRepository } from '../../data/FileStorageRepository';
import { FileMetadata, FileRecord } from '../file-storage.types';

export class FileStorageService {
  constructor(private readonly repository: FileStorageRepository) {}

  // 001. List files (paginated)
  async listFiles(options: { limit?: number; offset?: number; entityType?: string | null; entityId?: string | null }) {
    return this.repository.listFiles(options);
  }
  // 002. Upload a single file
  async uploadFile(fileBuffer: Buffer, metadata: FileMetadata): Promise<string> {
    return this.repository.uploadFile(fileBuffer, metadata);
  }
  // 003. Download a single file
  async downloadFile(fileId: string, userId?: string): Promise<Buffer> {
    return this.repository.downloadFile(fileId, userId);
  }
  // 004. Get metadata for a single file
  async getFileMetadata(fileId: string): Promise<FileRecord | null> {
    return this.repository.getFileMetadata(fileId);
  }
  // 005. Delete a single file
  async deleteFile(fileId: string): Promise<boolean> {
    return this.repository.deleteFile(fileId);
  }
}
