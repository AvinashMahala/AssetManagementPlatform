import { Property, PropertyInput } from '../../models/Property';

export interface IPropertyRepository {
  findAll(): Promise<Property[]>;
  findById(id: number): Promise<Property | null>;
  findByOwner(ownerId: number): Promise<Property[]>;
  create(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property>;
  update(id: number, data: Partial<Omit<Property, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Property | null>;
  delete(id: number): Promise<boolean>;
  updateStatus(id: number, status: string): Promise<boolean>;
}