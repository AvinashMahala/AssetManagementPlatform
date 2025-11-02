import { IUnitRepository } from '../interfaces/repositories/IUnitRepository.js';
import { Unit, UnitInput, UnitTenant, UnitTenantInput, UnitStatus } from '../models/Unit.js';
import { ValidationUtils } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { IUnitService } from '../interfaces/services/IUnitService.js';

export class UnitService implements IUnitService {
  private repository: IUnitRepository;

  constructor(repository: IUnitRepository) {
    this.repository = repository;
  }

  async getAllUnits(): Promise<Unit[]> {
    return await this.repository.findAll();
  }

  async getUnitById(id: string): Promise<Unit | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async getUnitsByProperty(propertyId: string): Promise<Unit[]> {
    const propertyValidation = ValidationUtils.validateUnitPropertyId(propertyId);
    if (!propertyValidation.isValid) {
      throw new Error(propertyValidation.message);
    }
    return await this.repository.findByProperty(propertyId);
  }

  async getUnitsByStatus(status: string): Promise<Unit[]> {
    const statusValidation = ValidationUtils.validateUnitStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.message);
    }
    return await this.repository.findByStatus(status);
  }

  async createUnit(unitData: UnitInput): Promise<Unit> {
    // Validate property ID
    const propertyValidation = ValidationUtils.validateUnitPropertyId(unitData.propertyId);
    if (!propertyValidation.isValid) {
      throw new Error(propertyValidation.message);
    }

    // Validate unit number
    const unitNumberValidation = ValidationUtils.validateUnitNumber(unitData.unitNumber);
    if (!unitNumberValidation.isValid) {
      throw new Error(unitNumberValidation.message);
    }

    // Validate unit name
    if (unitData.unitName !== undefined) {
      const unitNameValidation = ValidationUtils.validateUnitName(unitData.unitName);
      if (!unitNameValidation.isValid) {
        throw new Error(unitNameValidation.message);
      }
    }

    // Validate description
    if (unitData.description !== undefined) {
      const descriptionValidation = ValidationUtils.validateUnitDescription(unitData.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    // Validate unit type
    const unitTypeValidation = ValidationUtils.validateUnitType(unitData.unitType);
    if (!unitTypeValidation.isValid) {
      throw new Error(unitTypeValidation.message);
    }

    // Validate status
    if (unitData.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitStatus(unitData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    // Validate area
    const areaValidation = ValidationUtils.validateUnitArea(unitData.area);
    if (!areaValidation.isValid) {
      throw new Error(areaValidation.message);
    }

    // Validate floor
    if (unitData.floor !== undefined) {
      const floorValidation = ValidationUtils.validateUnitFloor(unitData.floor);
      if (!floorValidation.isValid) {
        throw new Error(floorValidation.message);
      }
    }

    // Validate bedrooms
    if (unitData.bedrooms !== undefined) {
      const bedroomsValidation = ValidationUtils.validateUnitBedrooms(unitData.bedrooms);
      if (!bedroomsValidation.isValid) {
        throw new Error(bedroomsValidation.message);
      }
    }

    // Validate bathrooms
    if (unitData.bathrooms !== undefined) {
      const bathroomsValidation = ValidationUtils.validateUnitBathrooms(unitData.bathrooms);
      if (!bathroomsValidation.isValid) {
        throw new Error(bathroomsValidation.message);
      }
    }

    // Validate balconies
    if (unitData.balconies !== undefined) {
      const balconiesValidation = ValidationUtils.validateUnitBalconies(unitData.balconies);
      if (!balconiesValidation.isValid) {
        throw new Error(balconiesValidation.message);
      }
    }

    // Validate max occupants
    if (unitData.maxOccupants !== undefined) {
      const maxOccupantsValidation = ValidationUtils.validateUnitMaxOccupants(unitData.maxOccupants);
      if (!maxOccupantsValidation.isValid) {
        throw new Error(maxOccupantsValidation.message);
      }
    }

    // Validate monthly rent
    const rentValidation = ValidationUtils.validateUnitMonthlyRent(unitData.monthlyRent);
    if (!rentValidation.isValid) {
      throw new Error(rentValidation.message);
    }

    // Validate security deposit
    const depositValidation = ValidationUtils.validateUnitSecurityDeposit(unitData.securityDeposit);
    if (!depositValidation.isValid) {
      throw new Error(depositValidation.message);
    }

    // Validate maintenance charges
    if (unitData.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateUnitMaintenanceCharges(unitData.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        throw new Error(maintenanceValidation.message);
      }
    }

    // Validate unit amenities
    if (unitData.unitAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateUnitAmenities(unitData.unitAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    // Validate unit photos
    if (unitData.unitPhotos !== undefined) {
      const photosValidation = ValidationUtils.validateUnitPhotos(unitData.unitPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    // Ensure optional fields have proper defaults
    const unitDataWithDefaults: UnitInput = {
      propertyId: unitData.propertyId,
      unitNumber: unitData.unitNumber,
      unitName: unitData.unitName,
      description: unitData.description,
      unitType: unitData.unitType,
      status: unitData.status || UnitStatus.AVAILABLE,
      floor: unitData.floor,
      area: unitData.area,
      bedrooms: unitData.bedrooms,
      bathrooms: unitData.bathrooms,
      balconies: unitData.balconies,
      furnished: unitData.furnished || false,
      maxOccupants: unitData.maxOccupants,
      unitAmenities: unitData.unitAmenities || [],
      unitPhotos: unitData.unitPhotos || [],
      monthlyRent: unitData.monthlyRent,
      securityDeposit: unitData.securityDeposit,
      maintenanceCharges: unitData.maintenanceCharges,
    };

    return await this.repository.create(unitDataWithDefaults);
  }

  async updateUnit(id: string, unitData: Partial<UnitInput>): Promise<Unit | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    // Validate fields if they are being updated
    if (unitData.unitNumber !== undefined) {
      const unitNumberValidation = ValidationUtils.validateUnitNumber(unitData.unitNumber);
      if (!unitNumberValidation.isValid) {
        throw new Error(unitNumberValidation.message);
      }
    }

    if (unitData.unitName !== undefined) {
      const unitNameValidation = ValidationUtils.validateUnitName(unitData.unitName);
      if (!unitNameValidation.isValid) {
        throw new Error(unitNameValidation.message);
      }
    }

    if (unitData.description !== undefined) {
      const descriptionValidation = ValidationUtils.validateUnitDescription(unitData.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    if (unitData.unitType !== undefined) {
      const unitTypeValidation = ValidationUtils.validateUnitType(unitData.unitType);
      if (!unitTypeValidation.isValid) {
        throw new Error(unitTypeValidation.message);
      }
    }

    if (unitData.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitStatus(unitData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    if (unitData.area !== undefined) {
      const areaValidation = ValidationUtils.validateUnitArea(unitData.area);
      if (!areaValidation.isValid) {
        throw new Error(areaValidation.message);
      }
    }

    if (unitData.floor !== undefined) {
      const floorValidation = ValidationUtils.validateUnitFloor(unitData.floor);
      if (!floorValidation.isValid) {
        throw new Error(floorValidation.message);
      }
    }

    if (unitData.bedrooms !== undefined) {
      const bedroomsValidation = ValidationUtils.validateUnitBedrooms(unitData.bedrooms);
      if (!bedroomsValidation.isValid) {
        throw new Error(bedroomsValidation.message);
      }
    }

    if (unitData.bathrooms !== undefined) {
      const bathroomsValidation = ValidationUtils.validateUnitBathrooms(unitData.bathrooms);
      if (!bathroomsValidation.isValid) {
        throw new Error(bathroomsValidation.message);
      }
    }

    if (unitData.balconies !== undefined) {
      const balconiesValidation = ValidationUtils.validateUnitBalconies(unitData.balconies);
      if (!balconiesValidation.isValid) {
        throw new Error(balconiesValidation.message);
      }
    }

    if (unitData.maxOccupants !== undefined) {
      const maxOccupantsValidation = ValidationUtils.validateUnitMaxOccupants(unitData.maxOccupants);
      if (!maxOccupantsValidation.isValid) {
        throw new Error(maxOccupantsValidation.message);
      }
    }

    if (unitData.monthlyRent !== undefined) {
      const rentValidation = ValidationUtils.validateUnitMonthlyRent(unitData.monthlyRent);
      if (!rentValidation.isValid) {
        throw new Error(rentValidation.message);
      }
    }

    if (unitData.securityDeposit !== undefined) {
      const depositValidation = ValidationUtils.validateUnitSecurityDeposit(unitData.securityDeposit);
      if (!depositValidation.isValid) {
        throw new Error(depositValidation.message);
      }
    }

    if (unitData.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateUnitMaintenanceCharges(unitData.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        throw new Error(maintenanceValidation.message);
      }
    }

    if (unitData.unitAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateUnitAmenities(unitData.unitAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    if (unitData.unitPhotos !== undefined) {
      const photosValidation = ValidationUtils.validateUnitPhotos(unitData.unitPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    return await this.repository.update(id, unitData);
  }

  async deleteUnit(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    return await this.repository.delete(id);
  }

  async updateUnitStatus(id: string, status: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.UNIT.INVALID_ID);
    }

    const statusValidation = ValidationUtils.validateUnitStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.message);
    }

    return await this.repository.updateStatus(id, status);
  }

  async getUnitTenants(unitId: string): Promise<UnitTenant[]> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    return await this.repository.findUnitTenants(unitId);
  }

  async assignTenantToUnit(unitTenantData: UnitTenantInput): Promise<UnitTenant> {
    // Validate unit ID
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitTenantData.unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    // Validate tenant ID
    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(unitTenantData.tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    // Validate rent share
    const rentShareValidation = ValidationUtils.validateUnitTenantRentShare(unitTenantData.monthlyRentShare);
    if (!rentShareValidation.isValid) {
      throw new Error(rentShareValidation.message);
    }

    // Validate security deposit share
    const depositShareValidation = ValidationUtils.validateUnitTenantSecurityDepositShare(unitTenantData.securityDepositShare);
    if (!depositShareValidation.isValid) {
      throw new Error(depositShareValidation.message);
    }

    // Validate status
    if (unitTenantData.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitTenantStatus(unitTenantData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    return await this.repository.assignTenantToUnit(unitTenantData);
  }

  async removeTenantFromUnit(unitId: string, tenantId: string): Promise<boolean> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    return await this.repository.removeTenantFromUnit(unitId, tenantId);
  }

  async updateTenantAssignment(unitId: string, tenantId: string, updates: Partial<UnitTenantInput>): Promise<UnitTenant | null> {
    const unitValidation = ValidationUtils.validateUnitTenantUnitId(unitId);
    if (!unitValidation.isValid) {
      throw new Error(unitValidation.message);
    }

    const tenantValidation = ValidationUtils.validateUnitTenantTenantId(tenantId);
    if (!tenantValidation.isValid) {
      throw new Error(tenantValidation.message);
    }

    // Validate fields if they are being updated
    if (updates.monthlyRentShare !== undefined) {
      const rentShareValidation = ValidationUtils.validateUnitTenantRentShare(updates.monthlyRentShare);
      if (!rentShareValidation.isValid) {
        throw new Error(rentShareValidation.message);
      }
    }

    if (updates.securityDepositShare !== undefined) {
      const depositShareValidation = ValidationUtils.validateUnitTenantSecurityDepositShare(updates.securityDepositShare);
      if (!depositShareValidation.isValid) {
        throw new Error(depositShareValidation.message);
      }
    }

    if (updates.status !== undefined) {
      const statusValidation = ValidationUtils.validateUnitTenantStatus(updates.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    return await this.repository.updateTenantAssignment(unitId, tenantId, updates);
  }
}