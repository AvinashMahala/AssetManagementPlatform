import { PropertyFile } from '../../models/Property';

export interface IPropertyFileService {
  uploadFile(propertyId: string, fileName: string, fileUrl: string, fileType: 'photo' | 'document', description?: string): Promise<PropertyFile>;
  getFilesByProperty(propertyId: string): Promise<PropertyFile[]>;
  getFilesByPropertyAndType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]>;
  getFileById(id: string): Promise<PropertyFile | null>;
  updateFile(id: string, updates: { fileName?: string; description?: string }): Promise<PropertyFile | null>;
  deleteFile(id: string): Promise<boolean>;
  deleteFilesByProperty(propertyId: string): Promise<number>;
}