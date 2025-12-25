
import { Property, PropertyInput } from '../types/property.types.js';

export interface IPropertyRepository {
  findAll(): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  findByOwner(ownerId: string): Promise<Property[]>;
  create(data: PropertyInput): Promise<Property>;
  update(id: string, data: Partial<PropertyInput>): Promise<Property | null>;
  delete(id: string): Promise<boolean>;
  
  // Legacy methods
  updateStatus(id: string, status: string): Promise<boolean>;
  updateReceiptSettings(id: string, settings: any): Promise<boolean>;
}
