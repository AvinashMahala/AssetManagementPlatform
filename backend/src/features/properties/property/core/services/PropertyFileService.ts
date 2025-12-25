import { IPropertyFileRepository } from '../interfaces/IPropertyFileRepository';
import { PropertyFile } from '../types/property.types';
import { ValidationUtils } from '@/shared/utils/validation';
import { ERROR_MESSAGES } from '@/shared/constants/validation';

export class PropertyFileService {
  constructor(private repository: IPropertyFileRepository) {}

  /**
   * Upload a new file for a property
   */
  async uploadFile(
    propertyId: string,
    fileName: string,
    fileId: string,
    fileType: 'photo' | 'document',
    description?: string
  ): Promise<PropertyFile> {
    // Validate property ID
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    // Validate file name
    if (!fileName || fileName.trim().length === 0) {
      throw new Error('File name is required');
    }

    // Validate file ID
    if (!fileId || fileId.trim().length === 0) {
      throw new Error('File ID is required');
    }

    // Validate file type
    if (!['photo', 'document'].includes(fileType)) {
      throw new Error('File type must be either "photo" or "document"');
    }

    // Validate description if provided
    if (description !== undefined && description.trim().length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }

    const fileData = {
      propertyId,
      fileName,
      fileId,
      fileType,
      description,
      uploadedAt: new Date()
    };

    return await this.repository.create(fileData);
  }

  /**
   * Get all files for a property
   */
  async getFilesByPropertyId(propertyId: string): Promise<PropertyFile[]> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }
    return await this.repository.getByPropertyId(propertyId);
  }

  /**
   * Get files by type for a property
   */
  async getFilesByPropertyIdAndType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }
    return await this.repository.getByPropertyIdAndType(propertyId, fileType);
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string): Promise<PropertyFile | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('File ID is required');
    }
    return await this.repository.getById(id);
  }

  /**
   * Update file details
   */
  async updateFile(id: string, updates: Partial<Pick<PropertyFile, 'fileName' | 'description'>>): Promise<PropertyFile | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('File ID is required');
    }

    if (updates.fileName !== undefined && updates.fileName.trim().length === 0) {
      throw new Error('File name cannot be empty');
    }

    if (updates.description !== undefined && updates.description.trim().length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }

    return await this.repository.update(id, updates);
  }

  /**
   * Delete a file
   */
  async deleteFile(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('File ID is required');
    }
    return await this.repository.delete(id);
  }

  /**
   * Delete all files for a property
   */
  async deleteFilesByPropertyId(propertyId: string): Promise<number> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }
    return await this.repository.deleteByPropertyId(propertyId);
  }
}
