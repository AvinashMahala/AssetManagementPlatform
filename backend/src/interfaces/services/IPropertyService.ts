import { Property, PropertyInput } from '../../models/Property';

export interface IPropertyService {
  getAllProperties(): Promise<Property[]>;
  getPropertyById(id: number): Promise<Property | null>;
  getPropertiesByOwner(ownerId: number): Promise<Property[]>;
  createProperty(propertyData: PropertyInput): Promise<Property>;
  updateProperty(id: number, propertyData: Partial<PropertyInput>): Promise<Property | null>;
  deleteProperty(id: number): Promise<boolean>;
  updatePropertyStatus(id: number, status: string): Promise<boolean>;
}