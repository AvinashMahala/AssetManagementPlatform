import { Property, PropertyInput } from '../../models/Property';
import { ReceiptTemplateSettings } from '../../models/ReceiptTemplate';
import { PropertyFile, PropertyReceiptTemplate } from '../../models/Property';

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
  uploadPropertyFile(propertyId: string, fileName: string, fileUrl: string, fileType: 'photo' | 'document', description?: string): Promise<PropertyFile>;
  getPropertyFiles(propertyId: string): Promise<PropertyFile[]>;
  getPropertyFilesByType(propertyId: string, fileType: 'photo' | 'document'): Promise<PropertyFile[]>;
  updatePropertyFile(id: string, updates: { fileName?: string; description?: string }): Promise<PropertyFile | null>;
  deletePropertyFile(id: string): Promise<boolean>;

  // Receipt template management methods
  createPropertyReceiptTemplate(propertyId: string, templateData: Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>): Promise<PropertyReceiptTemplate>;
  getPropertyReceiptTemplate(propertyId: string): Promise<PropertyReceiptTemplate | null>;
  updatePropertyReceiptTemplate(propertyId: string, updates: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>): Promise<PropertyReceiptTemplate | null>;
  deletePropertyReceiptTemplate(propertyId: string): Promise<boolean>;
  generatePropertyUPILinks(propertyId: string, amount?: number): Promise<string[]>;
}