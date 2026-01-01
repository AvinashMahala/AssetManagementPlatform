import { Unit, UnitInput } from '../types/unit.types.js';

export interface IUnitRepository {
  findAll(): Promise<Unit[]>;
  findById(id: string): Promise<Unit | null>;
  findByProperty(propertyId: string): Promise<Unit[]>;
  findByStatus(status: string): Promise<Unit[]>;
  create(data: UnitInput): Promise<Unit>;
  update(id: string, data: Partial<UnitInput>): Promise<Unit | null>;
  delete(id: string): Promise<boolean>;
}
