import { IMeterReadingRepository } from '../interfaces/IMeterReadingRepository';
import { IMeterReadingService } from '../interfaces/IMeterReadingService';
import { IMeterInfoService } from '../interfaces/IMeterInfoService';
import { MeterReading, MeterReadingInput } from '../types/meter.types';
import { MeterReadingCalculator } from './MeterReadingCalculator';

export class MeterReadingService implements IMeterReadingService {
  constructor(
    private meterReadingRepository: IMeterReadingRepository,
    private meterInfoService: IMeterInfoService
  ) {}

  async getAllMeterReadings(): Promise<MeterReading[]> {
    return await this.meterReadingRepository.findAll();
  }

  async getMeterReadingById(id: string): Promise<MeterReading | null> {
    if (!id) throw new Error('Invalid meter reading ID');
    return await this.meterReadingRepository.findById(id);
  }

  async getMeterReadingsByMeter(meterId: string): Promise<MeterReading[]> {
    if (!meterId) throw new Error('Invalid meter ID');
    return await this.meterReadingRepository.findByMeter(meterId);
  }

  async getMeterReadingsByMeterAndDateRange(meterId: string, startDate: Date, endDate: Date): Promise<MeterReading[]> {
    if (!meterId) throw new Error('Invalid meter ID');
    if (startDate > endDate) throw new Error('Start date cannot be after end date');
    return await this.meterReadingRepository.findByMeterAndDateRange(meterId, startDate, endDate);
  }

  async getLatestMeterReading(meterId: string): Promise<MeterReading | null> {
    if (!meterId) throw new Error('Invalid meter ID');
    return await this.meterReadingRepository.findLatestByMeter(meterId);
  }

  async createMeterReading(readingData: MeterReadingInput): Promise<MeterReading> {
    // Validate meter ID
    if (!readingData.meterId) throw new Error('Meter ID is required');
    if (!readingData.readingDate) throw new Error('Reading date is required');
    if (readingData.currentReading < 0) throw new Error('Current reading cannot be negative');
    if (!readingData.recordedBy) throw new Error('Recorded by user ID is required');

    // Check if there's already a reading for this month
    const startOfMonth = new Date(readingData.readingDate.getFullYear(), readingData.readingDate.getMonth(), 1);
    const endOfMonth = new Date(readingData.readingDate.getFullYear(), readingData.readingDate.getMonth() + 1, 0);
    
    const existingReadings = await this.meterReadingRepository.findByMeterAndDateRange(
      readingData.meterId,
      startOfMonth,
      endOfMonth
    );

    if (existingReadings.length > 0) {
      throw new Error('A reading already exists for this month');
    }
    // Get previous reading
    const latestReading = await this.meterReadingRepository.findLatestByMeter(readingData.meterId);
    const previousReading = latestReading ? latestReading.currentReading : 0;

    // Fetch minimal meter info through the abstracted MeterInfoService
    const meter = await this.meterInfoService.getMeterById(readingData.meterId);

    // Validate and compute using the calculator helper
    const { unitsConsumed, totalCost } = MeterReadingCalculator.validateAndCompute(meter, previousReading, readingData.currentReading);

    return await this.meterReadingRepository.create({
      ...readingData,
      previousReading,
      unitsConsumed,
      totalCost
    });
  }

  async updateMeterReading(id: string, readingData: Partial<MeterReadingInput>): Promise<MeterReading | null> {
    if (!id) throw new Error('Invalid meter reading ID');

    // If updating current reading, we might need to recalculate consumption and cost
    // But for now, let's just allow updating simple fields or implement full recalculation logic if needed.
    // The legacy service didn't seem to support full recalculation on update easily without fetching everything.
    // For simplicity and safety, let's restrict what can be updated or just pass it through if it's just metadata.
    
    // If currentReading is updated, we need to recalculate.
    if (readingData.currentReading !== undefined) {
       const existingReading = await this.meterReadingRepository.findById(id);
       if (!existingReading) throw new Error('Meter reading not found');

       const previousReading = existingReading.previousReading;

       // Fetch meter info via service and reuse calculator
       const meter = await this.meterInfoService.getMeterById(existingReading.meterId);
       const { unitsConsumed, totalCost } = MeterReadingCalculator.validateAndCompute(meter, previousReading, readingData.currentReading!);

       return await this.meterReadingRepository.update(id, {
         currentReading: readingData.currentReading,
         unitsConsumed,
         totalCost,
         meterPhotoUrl: readingData.meterPhotoUrl
       });
    }

    return await this.meterReadingRepository.update(id, {
      meterPhotoUrl: readingData.meterPhotoUrl
    });
  }

  async deleteMeterReading(id: string): Promise<boolean> {
    if (!id) throw new Error('Invalid meter reading ID');
    return await this.meterReadingRepository.delete(id);
  }
}
