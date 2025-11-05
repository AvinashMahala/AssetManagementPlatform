import { Property, PropertyInput } from '../../models/Property';
import { ReceiptTemplateSettings } from '../../models/ReceiptTemplate';

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
}