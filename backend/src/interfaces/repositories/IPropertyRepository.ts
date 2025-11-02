import { Property, PropertyInput } from '../../models/Property';

export interface IPropertyRepository {
  findAll(): Promise<Property[]>;
  findById(id: string): Promise<Property | null>;
  findByOwner(ownerId: string): Promise<Property[]>;
  create(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property>;
  update(id: string, data: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Property | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, status: string): Promise<boolean>;
}