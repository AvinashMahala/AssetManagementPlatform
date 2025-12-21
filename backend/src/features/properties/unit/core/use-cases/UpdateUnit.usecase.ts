import { IUseCase } from '@/shared/core/IUseCase.js';
import { IUnitRepository } from '../interfaces/IUnitRepository.js';
import { Unit, UnitInput } from '../types/unit.types.js';
import { ValidationUtils } from '@/shared/utils/validation.js';
import { ERROR_MESSAGES } from '@/shared/constants/validation.js';

export class UpdateUnitUseCase implements IUseCase<{ id: string; data: Partial<UnitInput> }, Unit> {
  constructor(private repository: IUnitRepository) {}

  async execute(request: { id: string; data: Partial<UnitInput> }): Promise<Unit> {
    const { id, data } = request;

    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    // Validate fields if they are being updated
    if (data.propertyId !== undefined) {
      const propertyValidation = ValidationUtils.validateUnitPropertyId(data.propertyId);
      if (!propertyValidation.isValid) {
        throw new Error(propertyValidation.message);
      }
    }

    if (data.unitNumber !== undefined) {
      const unitNumberValidation = ValidationUtils.validateUnitNumber(data.unitNumber);
      if (!unitNumberValidation.isValid) {
        throw new Error(unitNumberValidation.message);
      }
    }

    if (data.unitName !== undefined) {
      const unitNameValidation = ValidationUtils.validateUnitName(data.unitName);
      if (!unitNameValidation.isValid) {
        throw new Error(unitNameValidation.message);
      }
    }

    if (data.description !== undefined) {
      const descriptionValidation = ValidationUtils.validateUnitDescription(data.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    if (data.unitType !== undefined) {
      const typeValidation = ValidationUtils.validateUnitType(data.unitType);
      if (!typeValidation.isValid) {
        throw new Error(typeValidation.message);
      }
    }

    if (data.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitStatus(data.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    if (data.area !== undefined) {
      const areaValidation = ValidationUtils.validateUnitArea(data.area);
      if (!areaValidation.isValid) {
        throw new Error(areaValidation.message);
      }
    }

    if (data.floor !== undefined) {
      const floorValidation = ValidationUtils.validateUnitFloor(data.floor);
      if (!floorValidation.isValid) {
        throw new Error(floorValidation.message);
      }
    }

    if (data.bedrooms !== undefined) {
      const bedroomsValidation = ValidationUtils.validateUnitBedrooms(data.bedrooms);
      if (!bedroomsValidation.isValid) {
        throw new Error(bedroomsValidation.message);
      }
    }

    if (data.bathrooms !== undefined) {
      const bathroomsValidation = ValidationUtils.validateUnitBathrooms(data.bathrooms);
      if (!bathroomsValidation.isValid) {
        throw new Error(bathroomsValidation.message);
      }
    }

    if (data.balconies !== undefined) {
      const balconiesValidation = ValidationUtils.validateUnitBalconies(data.balconies);
      if (!balconiesValidation.isValid) {
        throw new Error(balconiesValidation.message);
      }
    }

    if (data.maxOccupants !== undefined) {
      const maxOccupantsValidation = ValidationUtils.validateUnitMaxOccupants(data.maxOccupants);
      if (!maxOccupantsValidation.isValid) {
        throw new Error(maxOccupantsValidation.message);
      }
    }

    if (data.unitAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateAmenities(data.unitAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    if (data.unitPhotos !== undefined) {
      const photosValidation = ValidationUtils.validatePhotos(data.unitPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    if (data.monthlyRent !== undefined) {
      const rentValidation = ValidationUtils.validateMonthlyRent(data.monthlyRent);
      if (!rentValidation.isValid) {
        throw new Error(rentValidation.message);
      }
    }

    if (data.securityDeposit !== undefined) {
      const depositValidation = ValidationUtils.validateSecurityDeposit(data.securityDeposit);
      if (!depositValidation.isValid) {
        throw new Error(depositValidation.message);
      }
    }

    if (data.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateMaintenanceCharges(data.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        throw new Error(maintenanceValidation.message);
      }
    }

    const unit = await this.repository.update(id, data);
    if (!unit) {
      throw new Error('Unit not found');
    }
    return unit;
  }
}
