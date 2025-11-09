import { apiClient } from './apiClient';
import { API_BASE_URL } from '../constants/api';
import type {
  FileMetadata,
  FileUploadRequest,
  FileUploadResponse,
  FileListResponse,
  FileStorageStats
} from '../types/file';
import type { ApiResponse } from '../types/api';

class FileService {
  /**
   * Upload a file
   */
  async uploadFile(
    request: FileUploadRequest
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('entityType', request.entityType);
    formData.append('entityId', request.entityId);

    if (request.category) {
      formData.append('category', request.category);
    }

    if (request.tags && request.tags.length > 0) {
      formData.append('tags', request.tags.join(','));
    }

    // For file uploads, we need to use fetch directly to handle FormData
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: data.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            details: data.error?.details,
          },
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Upload failed',
        },
      };
    }
  }

  /**
   * Download a file
   */
  async downloadFile(fileId: string): Promise<Blob> {
    try {
      const response = await apiClient.download(`/api/files/${fileId}/download`);
      return response.blob();
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Download failed');
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<ApiResponse<FileMetadata>> {
    return apiClient.get<FileMetadata>(`/api/files/${fileId}/metadata`);
  }

  /**
   * List files for an entity
   */
  async listEntityFiles(entityType: string, entityId: string): Promise<ApiResponse<FileListResponse>> {
    return apiClient.get<FileListResponse>(`/api/files/entity/${entityType}/${entityId}`);
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/files/${fileId}`);
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<ApiResponse<FileStorageStats>> {
    return apiClient.get<FileStorageStats>('/api/files/stats');
  }

  /**
   * Get download URL for a file (for use in img src, etc.)
   */
  getDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}/api/files/${fileId}/download`;
  }

  /**
   * List all files with optional filters
   */
  async listAllFiles(filters?: {
    entityType?: string;
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<FileListResponse>> {
    const params = new URLSearchParams();

    if (filters?.entityType) params.append('entityType', filters.entityType);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const queryString = params.toString();
    const url = queryString ? `/api/files?${queryString}` : '/api/files';

    return apiClient.get<FileListResponse>(url);
  }

  /**
   * Check if file is an image
   */
  isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if file is a PDF
   */
  isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file icon based on mime type
   */
  getFileIcon(mimeType: string): string {
    if (this.isImageFile(mimeType)) return '🖼️';
    if (this.isPdfFile(mimeType)) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('text')) return '📄';
    return '📎';
  }
}

// Export singleton instance
export const fileService = new FileService();
export default fileService;