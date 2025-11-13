import { Meter, MeterInput, MeterReading, MeterReadingInput, MeterTrendData, MeterStatistics } from '../../models/Meter';
import { PaginationOptions, PaginationResult, MeterFilters } from '../../types/pagination';

export interface IMeterService {
  getAllMeters(): Promise<Meter[]>;
  getMetersPaginated(options: PaginationOptions, filters?: MeterFilters): Promise<PaginationResult<Meter>>;
  getMeterById(id: string): Promise<Meter | null>;
  getMetersByUnit(unitId: string): Promise<Meter[]>;
  getMetersByProperty(propertyId: string): Promise<Meter[]>;
  getActiveMetersByUnit(unitId: string): Promise<Meter[]>;
  createMeter(meterData: MeterInput): Promise<Meter>;
  updateMeter(id: string, meterData: Partial<MeterInput>): Promise<Meter | null>;
  deleteMeter(id: string): Promise<boolean>;
  updateMeterStatus(id: string, isActive: boolean): Promise<boolean>;
}

export interface IMeterReadingService {
  getAllMeterReadings(): Promise<MeterReading[]>;
  getMeterReadingById(id: string): Promise<MeterReading | null>;
  getMeterReadingsByMeter(meterId: string): Promise<MeterReading[]>;
  getMeterReadingsByMeterAndDateRange(meterId: string, startDate: Date, endDate: Date): Promise<MeterReading[]>;
  getLatestMeterReading(meterId: string): Promise<MeterReading | null>;
  createMeterReading(readingData: MeterReadingInput): Promise<MeterReading>;
  updateMeterReading(id: string, readingData: Partial<MeterReadingInput>): Promise<MeterReading | null>;
  deleteMeterReading(id: string): Promise<boolean>;
  getMeterTrendData(meterId: string, months?: number): Promise<MeterTrendData[]>;
  getMeterStatistics(meterId: string): Promise<MeterStatistics | null>;
}