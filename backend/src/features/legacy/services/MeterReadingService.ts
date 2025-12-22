import { IMeterReadingRepository } from '@/interfaces/repositories/IMeterRepository.js';
import { MeterReading, MeterReadingInput, MeterTrendData, MeterStatistics } from '@/models/Meter.js';
import { IMeterReadingService } from '@/interfaces/services/IMeterService.js';

export class MeterReadingService implements IMeterReadingService {
  private repository: IMeterReadingRepository;

  constructor(repository: IMeterReadingRepository) {
    this.repository = repository;
  }

  async getAllMeterReadings(): Promise<MeterReading[]> {
    return await this.repository.findAll();
  }

  async getMeterReadingById(id: string): Promise<MeterReading | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid meter reading ID');
    }
    return await this.repository.findById(id);
  }

  async getMeterReadingsByMeter(meterId: string): Promise<MeterReading[]> {
    if (!meterId || meterId.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    return await this.repository.findByMeter(meterId);
  }

  async getMeterReadingsByMeterAndDateRange(meterId: string, startDate: Date, endDate: Date): Promise<MeterReading[]> {
    if (!meterId || meterId.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }
    return await this.repository.findByMeterAndDateRange(meterId, startDate, endDate);
  }

  async getLatestMeterReading(meterId: string): Promise<MeterReading | null> {
    if (!meterId || meterId.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    return await this.repository.findLatestByMeter(meterId);
  }

  async createMeterReading(readingData: MeterReadingInput): Promise<MeterReading> {
    // Validate meter ID
    if (!readingData.meterId || readingData.meterId.trim().length === 0) {
      throw new Error('Meter ID is required');
    }

    // Validate reading date
    if (!readingData.readingDate) {
      throw new Error('Reading date is required');
    }

    // Validate readings
    if (readingData.previousReading < 0) {
      throw new Error('Previous reading cannot be negative');
    }
    if (readingData.currentReading < 0) {
      throw new Error('Current reading cannot be negative');
    }
    if (readingData.currentReading < readingData.previousReading) {
      throw new Error('Current reading cannot be less than previous reading');
    }

    // Validate recorded by
    if (!readingData.recordedBy || readingData.recordedBy.trim().length === 0) {
      throw new Error('Recorded by user ID is required');
    }

    // Check if there's already a reading for this date
    const existingReadings = await this.repository.findByMeterAndDateRange(
      readingData.meterId,
      new Date(readingData.readingDate.getFullYear(), readingData.readingDate.getMonth(), 1),
      new Date(readingData.readingDate.getFullYear(), readingData.readingDate.getMonth() + 1, 0)
    );

    if (existingReadings.length > 0) {
      throw new Error('A reading already exists for this month');
    }

    return await this.repository.create(readingData);
  }

  async updateMeterReading(id: string, readingData: Partial<MeterReadingInput>): Promise<MeterReading | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid meter reading ID');
    }

    // Validate readings if provided
    if (readingData.previousReading !== undefined && readingData.previousReading < 0) {
      throw new Error('Previous reading cannot be negative');
    }
    if (readingData.currentReading !== undefined && readingData.currentReading < 0) {
      throw new Error('Current reading cannot be negative');
    }
    if (readingData.previousReading !== undefined && readingData.currentReading !== undefined &&
        readingData.currentReading < readingData.previousReading) {
      throw new Error('Current reading cannot be less than previous reading');
    }

    return await this.repository.update(id, readingData);
  }

  async deleteMeterReading(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid meter reading ID');
    }
    return await this.repository.delete(id);
  }

  async getMeterTrendData(meterId: string, months: number = 6): Promise<MeterTrendData[]> {
    if (!meterId || meterId.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    if (months < 1 || months > 24) {
      throw new Error('Months must be between 1 and 24');
    }
    return await this.repository.getTrendData(meterId, months);
  }

  async getMeterStatistics(meterId: string): Promise<MeterStatistics | null> {
    if (!meterId || meterId.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    return await this.repository.getStatistics(meterId);
  }
}