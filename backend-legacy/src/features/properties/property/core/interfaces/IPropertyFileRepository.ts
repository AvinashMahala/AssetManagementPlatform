import { PropertyFile } from '../types/property.types';

export interface IPropertyFileRepository {
  create(fileData: Omit<PropertyFile, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyFile>;
  getByPropertyId(propertyId: string): Promise<PropertyFile[]>;
  getByPropertyIdAndType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]>;
  getById(id: string): Promise<PropertyFile | null>;
  update(id: string, updates: Partial<Pick<PropertyFile, 'fileName' | 'description'>>): Promise<PropertyFile | null>;
  delete(id: string): Promise<boolean>;
  deleteByPropertyId(propertyId: string): Promise<number>;
}
