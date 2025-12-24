import { FileStorageRepository } from '../../data/FileStorageRepository';
import { FileMetadata, FileRecord } from '../file-storage.types';

export class FileStorageService {
  constructor(private readonly repository: FileStorageRepository) {}

  async uploadFile(fileBuffer: Buffer, metadata: FileMetadata): Promise<string> {
    return this.repository.uploadFile(fileBuffer, metadata);
  }

  async downloadFile(fileId: string, userId?: string): Promise<Buffer> {
    return this.repository.downloadFile(fileId, userId);
  }

  async getFileMetadata(fileId: string): Promise<FileRecord | null> {
    return this.repository.getFileMetadata(fileId);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    return this.repository.deleteFile(fileId);
  }

  async listFiles(options: { limit?: number; offset?: number; entityType?: string | null; entityId?: string | null }) {
    return this.repository.listFiles(options);
  }
}
