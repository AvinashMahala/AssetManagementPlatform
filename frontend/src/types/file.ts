// File-related type definitions
export interface FileMetadata {
  id: string;
  entityType: string;
  entityId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash?: string;
  category?: string;
  tags?: string[];
  uploadedBy: string | null;
  uploadedAt: string;
  lastAccessed?: string;
  version: number;
}

export interface FileUploadRequest {
  file: File;
  entityType: string;
  entityId: string;
  category?: string;
  tags?: string[];
}

export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  message: string;
}

export interface FileListResponse {
  files: FileMetadata[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FileStorageStats {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  filesByCategory: Record<string, number>;
}

export type FileCategory = 'photo' | 'document' | 'contract' | 'receipt' | 'other';

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}