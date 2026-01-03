import { Property, PropertyInput, PropertyFile, PropertyReceiptTemplate } from '../types/property.types';
import { ReceiptTemplateSettings } from '@/features/finance/receipt-template/core/receipt-template.types';

export interface IPropertyService {
  getAllProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  getPropertiesByOwner(ownerId: string): Promise<Property[]>;

  createProperty(propertyData: PropertyInput): Promise<Property>;
  updateProperty(id: string, propertyData: Partial<PropertyInput>): Promise<Property | null>;
  deleteProperty(id: string): Promise<boolean>;
  updatePropertyStatus(id: string, status: string): Promise<boolean>;

  // Template management methods
  getPropertyTemplateSettings(propertyId: string): Promise<ReceiptTemplateSettings | null>;
  setPropertyTemplate(propertyId: string, templateId: string, overrides?: Partial<ReceiptTemplateSettings>): Promise<boolean>;
  removePropertyTemplate(propertyId: string): Promise<boolean>;

  // File management methods
  addPropertyFile(propertyId: string, file: Omit<PropertyFile, 'id' | 'propertyId' | 'uploadedAt' | 'createdAt' | 'updatedAt'>): Promise<PropertyFile>;
  getPropertyFiles(propertyId: string): Promise<PropertyFile[]>;
  deletePropertyFile(fileId: string): Promise<boolean>;
}
