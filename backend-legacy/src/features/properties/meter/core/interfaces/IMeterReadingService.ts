import { MeterReading, MeterReadingInput } from '../types/meter.types';

export interface IMeterReadingService {
  getAllMeterReadings(): Promise<MeterReading[]>;
  getMeterReadingById(id: string): Promise<MeterReading | null>;
  getMeterReadingsByMeter(meterId: string): Promise<MeterReading[]>;
  getMeterReadingsByMeterAndDateRange(meterId: string, startDate: Date, endDate: Date): Promise<MeterReading[]>;
  getLatestMeterReading(meterId: string): Promise<MeterReading | null>;
  createMeterReading(readingData: MeterReadingInput): Promise<MeterReading>;
  updateMeterReading(id: string, readingData: Partial<MeterReadingInput>): Promise<MeterReading | null>;
  deleteMeterReading(id: string): Promise<boolean>;
}
