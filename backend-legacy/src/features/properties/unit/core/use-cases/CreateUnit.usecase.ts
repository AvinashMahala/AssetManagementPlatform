import { IUseCase } from '@/shared/core/IUseCase.js';
import { IUnitRepository } from '../interfaces/IUnitRepository.js';
import { Unit, UnitInput, UnitStatus } from '../types/unit.types.js';
import { ValidationUtils } from '@/shared/utils/validation.js';
import { ERROR_MESSAGES } from '@/shared/constants/validation.js';

export class CreateUnitUseCase implements IUseCase<UnitInput, Unit> {
  constructor(private repository: IUnitRepository) {}

  async execute(data: UnitInput): Promise<Unit> {
    // Validate property ID
    const propertyValidation = ValidationUtils.validateUnitPropertyId(data.propertyId);
    if (!propertyValidation.isValid) {
      throw new Error(propertyValidation.message);
    }

    // Validate unit number
    const unitNumberValidation = ValidationUtils.validateUnitNumber(data.unitNumber);
    if (!unitNumberValidation.isValid) {
      throw new Error(unitNumberValidation.message);
    }

    // Validate unit name
    if (data.unitName !== undefined) {
      const unitNameValidation = ValidationUtils.validateUnitName(data.unitName);
      if (!unitNameValidation.isValid) {
        throw new Error(unitNameValidation.message);
      }
    }

    // Validate description
    if (data.description !== undefined) {
      const descriptionValidation = ValidationUtils.validateUnitDescription(data.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    // Validate unit type
    const typeValidation = ValidationUtils.validateUnitType(data.unitType);
    if (!typeValidation.isValid) {
      throw new Error(typeValidation.message);
    }

    // Validate status
    if (data.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitStatus(data.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    // Validate area
    const areaValidation = ValidationUtils.validateUnitArea(data.area);
    if (!areaValidation.isValid) {
      throw new Error(areaValidation.message);
    }

    // Validate floor
    if (data.floor !== undefined) {
      const floorValidation = ValidationUtils.validateUnitFloor(data.floor);
      if (!floorValidation.isValid) {
        throw new Error(floorValidation.message);
      }
    }

    // Validate bedrooms
    if (data.bedrooms !== undefined) {
      const bedroomsValidation = ValidationUtils.validateUnitBedrooms(data.bedrooms);
      if (!bedroomsValidation.isValid) {
        throw new Error(bedroomsValidation.message);
      }
    }

    // Validate bathrooms
    if (data.bathrooms !== undefined) {
      const bathroomsValidation = ValidationUtils.validateUnitBathrooms(data.bathrooms);
      if (!bathroomsValidation.isValid) {
        throw new Error(bathroomsValidation.message);
      }
    }

    // Validate balconies
    if (data.balconies !== undefined) {
      const balconiesValidation = ValidationUtils.validateUnitBalconies(data.balconies);
      if (!balconiesValidation.isValid) {
        throw new Error(balconiesValidation.message);
      }
    }

    // Validate max occupants
    if (data.maxOccupants !== undefined) {
      const maxOccupantsValidation = ValidationUtils.validateUnitMaxOccupants(data.maxOccupants);
      if (!maxOccupantsValidation.isValid) {
        throw new Error(maxOccupantsValidation.message);
      }
    }

    // Validate amenities
    if (data.unitAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateAmenities(data.unitAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    // Validate photos
    if (data.unitPhotos !== undefined) {
      const photosValidation = ValidationUtils.validatePhotos(data.unitPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    // Validate monthly rent
    const rentValidation = ValidationUtils.validateMonthlyRent(data.monthlyRent);
    if (!rentValidation.isValid) {
      throw new Error(rentValidation.message);
    }

    // Validate security deposit
    const depositValidation = ValidationUtils.validateSecurityDeposit(data.securityDeposit);
    if (!depositValidation.isValid) {
      throw new Error(depositValidation.message);
    }

    // Validate maintenance charges
    if (data.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateMaintenanceCharges(data.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        throw new Error(maintenanceValidation.message);
      }
    }

    const unitData = {
      ...data,
      status: data.status || UnitStatus.AVAILABLE,
      unitAmenities: data.unitAmenities || [],
      unitPhotos: data.unitPhotos || [],
      furnished: data.furnished || false
    };

    return this.repository.create(unitData);
  }
}
