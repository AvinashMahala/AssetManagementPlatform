import { Meter, MeterInput, MeterReading, MeterReadingInput, MeterTrendData, MeterStatistics } from '../../models/Meter';
import { PaginationOptions, PaginationResult, MeterFilters } from '@/shared/types/pagination';

export interface IMeterRepository {
  findAll(): Promise<Meter[]>;
  findPaginated(options: PaginationOptions, filters?: MeterFilters): Promise<PaginationResult<Meter>>;
  findById(id: string): Promise<Meter | null>;
  findByUnit(unitId: string): Promise<Meter[]>;
  findByProperty(propertyId: string): Promise<Meter[]>;
  findActiveByUnit(unitId: string): Promise<Meter[]>;
  create(data: Omit<Meter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meter>;
  update(id: string, data: Partial<Omit<Meter, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Meter | null>;
  delete(id: string): Promise<boolean>;
  updateStatus(id: string, isActive: boolean): Promise<boolean>;
}

export interface IMeterReadingRepository {
  findAll(): Promise<MeterReading[]>;
  findById(id: string): Promise<MeterReading | null>;
  findByMeter(meterId: string): Promise<MeterReading[]>;
  findByMeterAndDateRange(meterId: string, startDate: Date, endDate: Date): Promise<MeterReading[]>;
  findLatestByMeter(meterId: string): Promise<MeterReading | null>;
  create(data: Omit<MeterReading, 'id' | 'unitsConsumed' | 'totalCost' | 'createdAt'>): Promise<MeterReading>;
  update(id: string, data: Partial<Omit<MeterReading, 'id' | 'createdAt'>>): Promise<MeterReading | null>;
  delete(id: string): Promise<boolean>;
  getTrendData(meterId: string, months?: number): Promise<MeterTrendData[]>;
  getStatistics(meterId: string): Promise<MeterStatistics | null>;
}