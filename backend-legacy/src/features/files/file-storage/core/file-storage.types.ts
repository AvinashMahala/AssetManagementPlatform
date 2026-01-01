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
  entityType?: string;
  entityId?: string;
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
