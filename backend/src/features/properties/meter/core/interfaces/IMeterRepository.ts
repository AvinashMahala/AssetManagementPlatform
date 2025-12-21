import { Meter, MeterInput } from '../types/meter.types.js';

export interface IMeterRepository {
  findAll(): Promise<Meter[]>;
  findById(id: string): Promise<Meter | null>;
  findByUnit(unitId: string): Promise<Meter[]>;
  findByProperty(propertyId: string): Promise<Meter[]>;
  findActiveByUnit(unitId: string): Promise<Meter[]>;
  create(data: MeterInput): Promise<Meter>;
  update(id: string, data: Partial<MeterInput>): Promise<Meter | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, isActive: boolean): Promise<boolean>;
}
