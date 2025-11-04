import { IMeterRepository } from '../interfaces/repositories/IMeterRepository.js';
import { Meter, MeterInput, MeterType } from '../models/Meter.js';
import { ValidationUtils } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { IMeterService } from '../interfaces/services/IMeterService.js';

export class MeterService implements IMeterService {
  private repository: IMeterRepository;

  constructor(repository: IMeterRepository) {
    this.repository = repository;
  }

  async getAllMeters(): Promise<Meter[]> {
    return await this.repository.findAll();
  }

  async getMeterById(id: string): Promise<Meter | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    return await this.repository.findById(id);
  }

  async getMetersByUnit(unitId: string): Promise<Meter[]> {
    if (!unitId || unitId.trim().length === 0) {
      throw new Error('Invalid unit ID');
    }
    return await this.repository.findByUnit(unitId);
  }

  async getMetersByProperty(propertyId: string): Promise<Meter[]> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error('Invalid property ID');
    }
    return await this.repository.findByProperty(propertyId);
  }

  async getActiveMetersByUnit(unitId: string): Promise<Meter[]> {
    if (!unitId || unitId.trim().length === 0) {
      throw new Error('Invalid unit ID');
    }
    return await this.repository.findActiveByUnit(unitId);
  }

  async createMeter(meterData: MeterInput): Promise<Meter> {
    // Validate meter name
    if (!meterData.meterName || meterData.meterName.trim().length === 0) {
      throw new Error('Meter name is required');
    }
    if (meterData.meterName.length > 100) {
      throw new Error('Meter name must be less than 100 characters');
    }

    // Validate meter type
    const validTypes = Object.values(MeterType);
    if (!validTypes.includes(meterData.meterType)) {
      throw new Error(`Invalid meter type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate cost per unit
    if (meterData.costPerUnit < 0) {
      throw new Error('Cost per unit cannot be negative');
    }

    // Validate fixed charge
    if (meterData.fixedCharge !== undefined && meterData.fixedCharge < 0) {
      throw new Error('Fixed charge cannot be negative');
    }

    // Validate unit ID and property ID
    if (!meterData.unitId || meterData.unitId.trim().length === 0) {
      throw new Error('Unit ID is required');
    }
    if (!meterData.propertyId || meterData.propertyId.trim().length === 0) {
      throw new Error('Property ID is required');
    }

    // Validate meter number if provided
    if (meterData.meterNumber && meterData.meterNumber.length > 50) {
      throw new Error('Meter number must be less than 50 characters');
    }

    // Validate remarks if provided
    if (meterData.remarks && meterData.remarks.length > 255) {
      throw new Error('Remarks must be less than 255 characters');
    }

    // Ensure isActive has a default value
    const meterDataToCreate = {
      ...meterData,
      isActive: meterData.isActive !== undefined ? meterData.isActive : true
    };

    return await this.repository.create(meterDataToCreate);
  }

  async updateMeter(id: string, meterData: Partial<MeterInput>): Promise<Meter | null> {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }

    // Validate meter name if provided
    if (meterData.meterName !== undefined) {
      if (!meterData.meterName || meterData.meterName.trim().length === 0) {
        throw new Error('Meter name cannot be empty');
      }
      if (meterData.meterName.length > 100) {
        throw new Error('Meter name must be less than 100 characters');
      }
    }

    // Validate meter type if provided
    if (meterData.meterType !== undefined) {
      const validTypes = Object.values(MeterType);
      if (!validTypes.includes(meterData.meterType)) {
        throw new Error(`Invalid meter type. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Validate cost per unit if provided
    if (meterData.costPerUnit !== undefined && meterData.costPerUnit < 0) {
      throw new Error('Cost per unit cannot be negative');
    }

    // Validate fixed charge if provided
    if (meterData.fixedCharge !== undefined && meterData.fixedCharge < 0) {
      throw new Error('Fixed charge cannot be negative');
    }

    // Validate meter number if provided
    if (meterData.meterNumber !== undefined && meterData.meterNumber.length > 50) {
      throw new Error('Meter number must be less than 50 characters');
    }

    // Validate remarks if provided
    if (meterData.remarks !== undefined && meterData.remarks.length > 255) {
      throw new Error('Remarks must be less than 255 characters');
    }

    return await this.repository.update(id, meterData);
  }

  async deleteMeter(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    return await this.repository.delete(id);
  }

  async updateMeterStatus(id: string, isActive: boolean): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid meter ID');
    }
    return await this.repository.updateStatus(id, isActive);
  }
}