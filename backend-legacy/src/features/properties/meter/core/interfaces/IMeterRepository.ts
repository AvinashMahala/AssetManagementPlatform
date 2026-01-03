
import { Meter, MeterInput } from '../types/meter.types';
import { PaginationOptions, PaginationResult } from '@/shared/types/pagination';

export interface MeterFilters {
  search?: string;
  meterType?: string;
  status?: string;
  propertyId?: string;
  unitId?: string;
}

export interface IMeterRepository {
  findAll(): Promise<Meter[]>;
  findPaginated(options: PaginationOptions, filters?: MeterFilters): Promise<PaginationResult<Meter>>;
  findById(id: string): Promise<Meter | null>;
  findByProperty(propertyId: string): Promise<Meter[]>;
  findByUnit(unitId: string): Promise<Meter[]>;
  findActiveByUnit(unitId: string): Promise<Meter[]>;
  create(meterData: MeterInput): Promise<Meter>;
  update(id: string, meterData: Partial<MeterInput>): Promise<Meter | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, isActive: boolean): Promise<boolean>;
}
