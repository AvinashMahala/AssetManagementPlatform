import { Property, PropertyInput } from '../../models/Property';

export interface IPropertyService {
  getAllProperties(): Promise<Property[]>;
  getPropertyById(id: string): Promise<Property | null>;
  getPropertiesByOwner(ownerId: string): Promise<Property[]>;
  createProperty(propertyData: PropertyInput): Promise<Property>;
  updateProperty(id: string, propertyData: Partial<PropertyInput>): Promise<Property | null>;
  deleteProperty(id: string): Promise<boolean>;
  updatePropertyStatus(id: string, status: string): Promise<boolean>;
}