import { IMeterRepository, MeterFilters } from '../interfaces/IMeterRepository';
import { IMeterService } from '../interfaces/IMeterService';
import { Meter, MeterInput } from '../types/meter.types';
import { PaginationOptions, PaginationResult } from '@/shared/types/pagination';

export class MeterService implements IMeterService {
  constructor(private meterRepository: IMeterRepository) {}

  async getAllMeters(): Promise<Meter[]> {
    return await this.meterRepository.findAll();
  }

  async getMetersPaginated(options: PaginationOptions, filters?: MeterFilters): Promise<PaginationResult<Meter>> {
    return await this.meterRepository.findPaginated(options, filters);
  }

  async getMeterById(id: string): Promise<Meter | null> {
    if (!id) throw new Error('Invalid meter ID');
    return await this.meterRepository.findById(id);
  }

  async getMetersByProperty(propertyId: string): Promise<Meter[]> {
    if (!propertyId) throw new Error('Invalid property ID');
    return await this.meterRepository.findByProperty(propertyId);
  }

  async getMetersByUnit(unitId: string): Promise<Meter[]> {
    if (!unitId) throw new Error('Invalid unit ID');
    return await this.meterRepository.findByUnit(unitId);
  }

  async getActiveMetersByUnit(unitId: string): Promise<Meter[]> {
    if (!unitId) throw new Error('Invalid unit ID');
    return await this.meterRepository.findActiveByUnit(unitId);
  }

  async createMeter(meterData: MeterInput): Promise<Meter> {
    // Validate required fields
    if (!meterData.propertyId) throw new Error('Property ID is required');
    if (!meterData.unitId) throw new Error('Unit ID is required');
    if (!meterData.meterType) throw new Error('Meter type is required');
    if (!meterData.meterName) throw new Error('Meter name is required');
    if (meterData.costPerUnit < 0) throw new Error('Cost per unit cannot be negative');

    return await this.meterRepository.create(meterData);
  }

  async updateMeter(id: string, updates: Partial<Meter>): Promise<Meter | null> {
    if (!id) throw new Error('Invalid meter ID');
    
    if (updates.costPerUnit !== undefined && updates.costPerUnit < 0) {
      throw new Error('Cost per unit cannot be negative');
    }

    return await this.meterRepository.update(id, updates);
  }

  async deleteMeter(id: string): Promise<boolean> {
    if (!id) throw new Error('Invalid meter ID');
    return await this.meterRepository.delete(id);
  }

  async updateMeterStatus(id: string, isActive: boolean): Promise<boolean> {
    if (!id) throw new Error('Invalid meter ID');
    return await this.meterRepository.updateStatus(id, isActive);
  }
}
