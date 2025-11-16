import { IPropertyFileRepository } from '../interfaces/repositories/IPropertyFileRepository';
import { IPropertyFileService } from '../interfaces/services/IPropertyFileService';
import { PropertyFile } from '../models/Property';
import { ValidationUtils } from '../utils/validation';
import { ERROR_MESSAGES } from '../constants/validation';

export class PropertyFileService implements IPropertyFileService {
  private repository: IPropertyFileRepository;

  constructor(repository: IPropertyFileRepository) {
    this.repository = repository;
  }

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
      fileName: fileName.trim(),
      fileId: fileId.trim(),
      fileType,
      description: description?.trim(),
      uploadedAt: new Date()
    };

    return await this.repository.create(fileData);
  }

  /**
   * Get all files for a property
   */
  async getFilesByProperty(propertyId: string): Promise<PropertyFile[]> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    return await this.repository.getByPropertyId(propertyId);
  }

  /**
   * Get files by type for a property
   */
  async getFilesByPropertyAndType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    if (!['photo', 'document'].includes(fileType)) {
      throw new Error('File type must be either "photo" or "document"');
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
   * Update file information
   */
  async updateFile(id: string, updates: { fileName?: string; description?: string }): Promise<PropertyFile | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('File ID is required');
    }

    // Validate file name if provided
    if (updates.fileName !== undefined) {
      if (!updates.fileName || updates.fileName.trim().length === 0) {
        throw new Error('File name cannot be empty');
      }
    }

    // Validate description if provided
    if (updates.description !== undefined && updates.description.trim().length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }

    const sanitizedUpdates = {
      fileName: updates.fileName?.trim(),
      description: updates.description?.trim()
    };

    return await this.repository.update(id, sanitizedUpdates);
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
  async deleteFilesByProperty(propertyId: string): Promise<number> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    return await this.repository.deleteByPropertyId(propertyId);
  }
}