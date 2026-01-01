import { MeterReading, MeterReadingInput } from '../types/meter.types';

export interface IMeterReadingRepository {
  findAll(): Promise<MeterReading[]>;
  findById(id: string): Promise<MeterReading | null>;
  findByMeter(meterId: string): Promise<MeterReading[]>;
  findByMeterAndDateRange(meterId: string, startDate: Date, endDate: Date): Promise<MeterReading[]>;
  findLatestByMeter(meterId: string): Promise<MeterReading | null>;
  create(readingData: MeterReadingInput & { previousReading: number; unitsConsumed: number; totalCost: number }): Promise<MeterReading>;
  update(id: string, updates: Partial<MeterReading>): Promise<MeterReading | null>;
  delete(id: string): Promise<boolean>;
}
