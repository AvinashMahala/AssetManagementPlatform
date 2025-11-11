import { PropertyReceiptTemplate } from '../../models/Property';

export interface IPropertyReceiptTemplateRepository {
  create(templateData: Omit<PropertyReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyReceiptTemplate>;
  getByPropertyId(propertyId: string): Promise<PropertyReceiptTemplate | null>;
  update(propertyId: string, updates: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>): Promise<PropertyReceiptTemplate | null>;
  deleteByPropertyId(propertyId: string): Promise<boolean>;
  existsForProperty(propertyId: string): Promise<boolean>;
}