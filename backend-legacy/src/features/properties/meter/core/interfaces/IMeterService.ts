import { Meter, MeterInput } from '../types/meter.types';
import { PaginationOptions, PaginationResult } from '@/shared/types/pagination';
import { MeterFilters } from './IMeterRepository';

export interface IMeterService {
  getAllMeters(): Promise<Meter[]>;
  getMetersPaginated(options: PaginationOptions, filters?: MeterFilters): Promise<PaginationResult<Meter>>;
  getMeterById(id: string): Promise<Meter | null>;
  getMetersByProperty(propertyId: string): Promise<Meter[]>;
  getMetersByUnit(unitId: string): Promise<Meter[]>;
  getActiveMetersByUnit(unitId: string): Promise<Meter[]>;
  createMeter(meterData: MeterInput): Promise<Meter>;
  updateMeter(id: string, updates: Partial<Meter>): Promise<Meter | null>;
  deleteMeter(id: string): Promise<boolean>;
  updateMeterStatus(id: string, isActive: boolean): Promise<boolean>;
}
