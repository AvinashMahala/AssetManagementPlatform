import { IUnitUtilityRepository } from '../interfaces/IUnitUtilityRepository.js';
import { IUnitUtilityService } from '../interfaces/IUnitUtilityService.js';
import { IMeterService } from '@/interfaces/services/IMeterService.js';
import { UnitUtility, UnitUtilityInput, UtilityType, UtilityBillingMethod } from '@/models/Unit.js';
import { ValidationUtils } from '@/shared/utils/validation.js';
import { ERROR_MESSAGES } from '@/shared/constants/validation.js';

export class UnitUtilityService implements IUnitUtilityService {
  private repository: IUnitUtilityRepository;
  private meterService: IMeterService;

  constructor(repository: IUnitUtilityRepository, meterService: IMeterService) {
    this.repository = repository;
    this.meterService = meterService;
  }

  async getAllUnitUtilities(): Promise<UnitUtility[]> {
    return await this.repository.findAll();
  }

  async getUnitUtilityById(id: string): Promise<UnitUtility | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT_UTILITY.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async getUnitUtilitiesByUnit(unitId: string): Promise<UnitUtility[]> {
    const unitValidation = ValidationUtils.validateUnitUtilityUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }
    return await this.repository.findByUnit(unitId);
  }

  async getUnitUtilitiesByProperty(propertyId: string): Promise<UnitUtility[]> {
    const propertyValidation = ValidationUtils.validateUnitUtilityPropertyId(propertyId);
    if (!propertyValidation.isValid) {
      throw new Error(propertyValidation.message);
    }
    return await this.repository.findByProperty(propertyId);
  }

  async createUnitUtility(utilityData: UnitUtilityInput): Promise<UnitUtility> {
    // Validate unit ID
    const unitValidation = ValidationUtils.validateUnitUtilityUnitId(utilityData.unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    // Validate property ID
    const propertyValidation = ValidationUtils.validateUnitUtilityPropertyId(utilityData.propertyId);
    if (!propertyValidation.isValid) {
      throw new Error(propertyValidation.message);
    }

    // Validate utility type
    const utilityTypeValidation = ValidationUtils.validateUnitUtilityType(utilityData.utilityType);
    if (!utilityTypeValidation.isValid) {
      throw new Error(utilityTypeValidation.message);
    }

    // Validate utility name
    const utilityNameValidation = ValidationUtils.validateUnitUtilityName(utilityData.utilityName);
    if (!utilityNameValidation.isValid) {
      throw new Error(utilityNameValidation.message);
    }

    // Validate billing method
    const billingMethodValidation = ValidationUtils.validateUnitUtilityBillingMethod(utilityData.billingMethod);
    if (!billingMethodValidation.isValid) {
      throw new Error(billingMethodValidation.message);
    }

    // Validate fixed amount if billing method is fixed
    if (utilityData.billingMethod === UtilityBillingMethod.FIXED) {
      const fixedAmountValidation = ValidationUtils.validateUnitUtilityFixedAmount(utilityData.fixedAmount);
      if (!fixedAmountValidation.isValid) {
        throw new Error(fixedAmountValidation.message);
      }
      if (utilityData.fixedAmount === undefined) {
        throw new Error('Fixed amount is required for fixed billing method');
      }
    }

    // Validate meter ID and multiplier if billing method is meter_based
    if (utilityData.billingMethod === UtilityBillingMethod.METER_BASED) {
      const meterIdValidation = ValidationUtils.validateUnitUtilityMeterId(utilityData.meterId, utilityData.billingMethod);
      if (!meterIdValidation.isValid) {
        throw new Error(meterIdValidation.message);
      }

      // Validate that the meter exists
      if (utilityData.meterId) {
        const meter = await this.meterService.getMeterById(utilityData.meterId);
        if (!meter) {
          throw new Error(ERROR_MESSAGES.UNIT_UTILITY.METER_NOT_FOUND);
        }
      }

      const multiplierValidation = ValidationUtils.validateUnitUtilityMultiplier(utilityData.multiplier);
      if (!multiplierValidation.isValid) {
        throw new Error(multiplierValidation.message);
      }
      if (utilityData.multiplier === undefined) {
        throw new Error('Multiplier is required for meter-based billing method');
      }
    }

    // Ensure optional fields have proper defaults
    const utilityDataWithDefaults: UnitUtilityInput = {
      unitId: utilityData.unitId,
      propertyId: utilityData.propertyId,
      utilityType: utilityData.utilityType,
      utilityName: utilityData.utilityName,
      isEnabled: utilityData.isEnabled !== undefined ? utilityData.isEnabled : true,
      billingMethod: utilityData.billingMethod,
      fixedAmount: utilityData.fixedAmount,
      meterId: utilityData.meterId,
      multiplier: utilityData.multiplier,
    };

    return await this.repository.create(utilityDataWithDefaults);
  }

  async updateUnitUtility(id: string, utilityData: Partial<UnitUtilityInput>): Promise<UnitUtility | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT_UTILITY.INVALID_ID);
    }

    // Validate fields if they are being updated
    if (utilityData.utilityType !== undefined) {
      const utilityTypeValidation = ValidationUtils.validateUnitUtilityType(utilityData.utilityType);
      if (!utilityTypeValidation.isValid) {
        throw new Error(utilityTypeValidation.message);
      }
    }

    if (utilityData.utilityName !== undefined) {
      const utilityNameValidation = ValidationUtils.validateUnitUtilityName(utilityData.utilityName);
      if (!utilityNameValidation.isValid) {
        throw new Error(utilityNameValidation.message);
      }
    }

    if (utilityData.billingMethod !== undefined) {
      const billingMethodValidation = ValidationUtils.validateUnitUtilityBillingMethod(utilityData.billingMethod);
      if (!billingMethodValidation.isValid) {
        throw new Error(billingMethodValidation.message);
      }
    }

    if (utilityData.fixedAmount !== undefined) {
      const fixedAmountValidation = ValidationUtils.validateUnitUtilityFixedAmount(utilityData.fixedAmount);
      if (!fixedAmountValidation.isValid) {
        throw new Error(fixedAmountValidation.message);
      }
    }

    if (utilityData.meterId !== undefined) {
      // Validate that the meter exists
      const meter = await this.meterService.getMeterById(utilityData.meterId);
      if (!meter) {
        throw new Error(ERROR_MESSAGES.UNIT_UTILITY.METER_NOT_FOUND);
      }
    }

    if (utilityData.multiplier !== undefined) {
      const multiplierValidation = ValidationUtils.validateUnitUtilityMultiplier(utilityData.multiplier);
      if (!multiplierValidation.isValid) {
        throw new Error(multiplierValidation.message);
      }
    }

    return await this.repository.update(id, utilityData);
  }

  async deleteUnitUtility(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT_UTILITY.INVALID_ID);
    }

    return await this.repository.delete(id);
  }

  async toggleUnitUtility(id: string, isEnabled: boolean): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT_UTILITY.INVALID_ID);
    }

    return await this.repository.updateStatus(id, isEnabled);
  }

  async calculateUtilityCharges(unitId: string, startDate: Date, endDate: Date): Promise<any> {
    const unitValidation = ValidationUtils.validateUnitUtilityUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const utilities = await this.repository.findByUnit(unitId);
    const charges: any[] = [];
    let totalAmount = 0;

    for (const utility of utilities) {
      if (!utility.isEnabled) continue;

      let chargeAmount = 0;
      let calculationDetails: any = {
        utilityId: utility.id,
        utilityName: utility.utilityName,
        utilityType: utility.utilityType,
        billingMethod: utility.billingMethod,
      };

      if (utility.billingMethod === UtilityBillingMethod.FIXED) {
        chargeAmount = utility.fixedAmount || 0;
        calculationDetails.fixedAmount = chargeAmount;
      } else if (utility.billingMethod === UtilityBillingMethod.METER_BASED && utility.meterId) {
        // Calculate meter-based charges
        const meterCharges = await this.calculateMeterBasedCharges(utility, startDate, endDate);
        chargeAmount = meterCharges.amount;
        calculationDetails = { ...calculationDetails, ...meterCharges.details };
      }

      charges.push({
        ...calculationDetails,
        amount: chargeAmount,
      });

      totalAmount += chargeAmount;
    }

    return {
      unitId,
      period: {
        startDate,
        endDate,
      },
      utilities: charges,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  async getUtilitySummary(unitId: string): Promise<any> {
    const unitValidation = ValidationUtils.validateUnitUtilityUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const utilities = await this.repository.findByUnit(unitId);

    const summary = {
      unitId,
      totalUtilities: utilities.length,
      enabledUtilities: utilities.filter(u => u.isEnabled).length,
      disabledUtilities: utilities.filter(u => !u.isEnabled).length,
      byType: {} as Record<string, number>,
      byBillingMethod: {
        fixed: 0,
        meter_based: 0,
      },
      utilities: utilities.map(u => ({
        id: u.id,
        name: u.utilityName,
        type: u.utilityType,
        billingMethod: u.billingMethod,
        isEnabled: u.isEnabled,
        hasMeter: !!u.meterId,
      })),
    };

    // Count by type and billing method
    utilities.forEach(utility => {
      summary.byType[utility.utilityType] = (summary.byType[utility.utilityType] || 0) + 1;

      if (utility.billingMethod === UtilityBillingMethod.FIXED) {
        summary.byBillingMethod.fixed++;
      } else if (utility.billingMethod === UtilityBillingMethod.METER_BASED) {
        summary.byBillingMethod.meter_based++;
      }
    });

    return summary;
  }

  async validateUtilityConfiguration(unitId: string): Promise<{ isValid: boolean; errors: string[] }> {
    const unitValidation = ValidationUtils.validateUnitUtilityUnitId(unitId);
    if (!unitValidation.isValid) {
      return { isValid: false, errors: [unitValidation.message!] };
    }

    const utilities = await this.repository.findByUnit(unitId);
    const errors: string[] = [];

    for (const utility of utilities) {
      // Check if meter-based utilities have valid meters
      if (utility.billingMethod === UtilityBillingMethod.METER_BASED) {
        if (!utility.meterId) {
          errors.push(`Utility "${utility.utilityName}" is meter-based but has no meter assigned`);
        } else {
          const meter = await this.meterService.getMeterById(utility.meterId);
          if (!meter) {
            errors.push(`Utility "${utility.utilityName}" references a non-existent meter`);
          }
        }

        if (!utility.multiplier) {
          errors.push(`Utility "${utility.utilityName}" is meter-based but has no multiplier set`);
        }
      }

      // Check if fixed utilities have amounts
      if (utility.billingMethod === UtilityBillingMethod.FIXED && utility.fixedAmount === undefined) {
        errors.push(`Utility "${utility.utilityName}" is fixed billing but has no amount set`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate charges for meter-based utilities
   */
  private async calculateMeterBasedCharges(utility: UnitUtility, startDate: Date, endDate: Date): Promise<{ amount: number; details: any }> {
    if (!utility.meterId || !utility.multiplier) {
      return { amount: 0, details: { error: 'Missing meter ID or multiplier' } };
    }

    try {
      // Get meter readings for the period
      const meter = await this.meterService.getMeterById(utility.meterId);
      if (!meter) {
        return { amount: 0, details: { error: 'Meter not found' } };
      }

      // This is a simplified calculation - in a real implementation,
      // you would get actual meter readings and calculate consumption
      const consumption = 0; // Placeholder - would be calculated from readings
      const amount = consumption * (meter.costPerUnit || 0) * utility.multiplier;

      return {
        amount: Math.round(amount * 100) / 100,
        details: {
          meterId: utility.meterId,
          meterName: meter.meterName,
          multiplier: utility.multiplier,
          costPerUnit: meter.costPerUnit,
          consumption,
          calculatedAmount: amount,
        },
      };
    } catch (error) {
      console.error('Error calculating meter-based charges:', error);
      return { amount: 0, details: { error: 'Failed to calculate charges' } };
    }
  }
}