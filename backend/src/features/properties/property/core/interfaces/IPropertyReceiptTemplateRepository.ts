import { PropertyReceiptTemplate } from '../types/property.types';

export interface IPropertyReceiptTemplateRepository {
  create(templateData: Omit<PropertyReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyReceiptTemplate>;
  getByPropertyId(propertyId: string): Promise<PropertyReceiptTemplate | null>;
  update(id: string, updates: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>): Promise<PropertyReceiptTemplate | null>;
  delete(id: string): Promise<boolean>;
  existsForProperty(propertyId: string): Promise<boolean>;
}
