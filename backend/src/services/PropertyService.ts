import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository.js';
import { Property, PropertyInput, PropertyStatus } from '../models/Property.js';
import { ValidationUtils } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { IPropertyService } from '../interfaces/services/IPropertyService.js';

export class PropertyService implements IPropertyService {
  private repository: IPropertyRepository;

  constructor(repository: IPropertyRepository) {
    this.repository = repository;
  }

  async getAllProperties(): Promise<Property[]> {
    return await this.repository.findAll();
  }

  async getPropertyById(id: number): Promise<Property | null> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async getPropertiesByOwner(ownerId: number): Promise<Property[]> {
    const ownerValidation = ValidationUtils.validatePropertyOwner(ownerId);
    if (!ownerValidation.isValid) {
      throw new Error(ownerValidation.message);
    }
    return await this.repository.findByOwner(ownerId);
  }

  async createProperty(propertyData: PropertyInput): Promise<Property> {
    // Validate property name
    const nameValidation = ValidationUtils.validatePropertyName(propertyData.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }

    // Validate property description
    const descriptionValidation = ValidationUtils.validatePropertyDescription(propertyData.description);
    if (!descriptionValidation.isValid) {
      throw new Error(descriptionValidation.message);
    }

    // Validate property type
    const typeValidation = ValidationUtils.validatePropertyType(propertyData.propertyType);
    if (!typeValidation.isValid) {
      throw new Error(typeValidation.message);
    }

    // Validate property status
    const statusValidation = ValidationUtils.validatePropertyStatus(propertyData.status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.message);
    }

    // Validate property area
    const areaValidation = ValidationUtils.validatePropertyArea(propertyData.area);
    if (!areaValidation.isValid) {
      throw new Error(areaValidation.message);
    }

    // Validate monthly rent
    const rentValidation = ValidationUtils.validateMonthlyRent(propertyData.monthlyRent);
    if (!rentValidation.isValid) {
      throw new Error(rentValidation.message);
    }

    // Validate security deposit
    const depositValidation = ValidationUtils.validateSecurityDeposit(propertyData.securityDeposit);
    if (!depositValidation.isValid) {
      throw new Error(depositValidation.message);
    }

    // Validate maintenance charges
    const maintenanceValidation = ValidationUtils.validateMaintenanceCharges(propertyData.maintenanceCharges);
    if (!maintenanceValidation.isValid) {
      throw new Error(maintenanceValidation.message);
    }

    // Validate address
    const addressValidation = ValidationUtils.validatePropertyAddress(propertyData.address);
    if (!addressValidation.isValid) {
      throw new Error(addressValidation.message);
    }

    // Validate owner
    const ownerValidation = ValidationUtils.validatePropertyOwner(propertyData.ownerId);
    if (!ownerValidation.isValid) {
      throw new Error(ownerValidation.message);
    }

    // Validate amenities
    const amenitiesValidation = ValidationUtils.validateAmenities(propertyData.amenities);
    if (!amenitiesValidation.isValid) {
      throw new Error(amenitiesValidation.message);
    }

    // Validate photos
    const photosValidation = ValidationUtils.validatePhotos(propertyData.photos);
    if (!photosValidation.isValid) {
      throw new Error(photosValidation.message);
    }

    // Ensure optional fields have proper defaults
    const propertyDataWithDefaults: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
      name: propertyData.name,
      description: propertyData.description,
      propertyType: propertyData.propertyType,
      status: (propertyData.status as PropertyStatus) || PropertyStatus.AVAILABLE,
      address: propertyData.address,
      area: propertyData.area,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      balconies: propertyData.balconies,
      floor: propertyData.floor,
      totalFloors: propertyData.totalFloors,
      amenities: propertyData.amenities || [],
      furnished: propertyData.furnished || false,
      parkingSpaces: propertyData.parkingSpaces,
      monthlyRent: propertyData.monthlyRent,
      securityDeposit: propertyData.securityDeposit,
      maintenanceCharges: propertyData.maintenanceCharges,
      ownerId: propertyData.ownerId,
      coOwners: propertyData.coOwners || [],
      photos: propertyData.photos || [],
    };

    return await this.repository.create(propertyDataWithDefaults);
  }

  async updateProperty(id: number, propertyData: Partial<PropertyInput>): Promise<Property | null> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    // Validate fields if they are being updated
    if (propertyData.name !== undefined) {
      const nameValidation = ValidationUtils.validatePropertyName(propertyData.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }
    }

    if (propertyData.description !== undefined) {
      const descriptionValidation = ValidationUtils.validatePropertyDescription(propertyData.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    if (propertyData.propertyType !== undefined) {
      const typeValidation = ValidationUtils.validatePropertyType(propertyData.propertyType);
      if (!typeValidation.isValid) {
        throw new Error(typeValidation.message);
      }
    }

    if (propertyData.status !== undefined) {
      const statusValidation = ValidationUtils.validatePropertyStatus(propertyData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    if (propertyData.area !== undefined) {
      const areaValidation = ValidationUtils.validatePropertyArea(propertyData.area);
      if (!areaValidation.isValid) {
        throw new Error(areaValidation.message);
      }
    }

    if (propertyData.monthlyRent !== undefined) {
      const rentValidation = ValidationUtils.validateMonthlyRent(propertyData.monthlyRent);
      if (!rentValidation.isValid) {
        throw new Error(rentValidation.message);
      }
    }

    if (propertyData.securityDeposit !== undefined) {
      const depositValidation = ValidationUtils.validateSecurityDeposit(propertyData.securityDeposit);
      if (!depositValidation.isValid) {
        throw new Error(depositValidation.message);
      }
    }

    if (propertyData.maintenanceCharges !== undefined) {
      const maintenanceValidation = ValidationUtils.validateMaintenanceCharges(propertyData.maintenanceCharges);
      if (!maintenanceValidation.isValid) {
        throw new Error(maintenanceValidation.message);
      }
    }

    if (propertyData.address !== undefined) {
      const addressValidation = ValidationUtils.validatePropertyAddress(propertyData.address);
      if (!addressValidation.isValid) {
        throw new Error(addressValidation.message);
      }
    }

    if (propertyData.ownerId !== undefined) {
      const ownerValidation = ValidationUtils.validatePropertyOwner(propertyData.ownerId);
      if (!ownerValidation.isValid) {
        throw new Error(ownerValidation.message);
      }
    }

    if (propertyData.amenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateAmenities(propertyData.amenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    if (propertyData.photos !== undefined) {
      const photosValidation = ValidationUtils.validatePhotos(propertyData.photos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    return await this.repository.update(id, propertyData);
  }

  async deleteProperty(id: number): Promise<boolean> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    return await this.repository.delete(id);
  }

  async updatePropertyStatus(id: number, status: string): Promise<boolean> {
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      throw new Error(idValidation.message || ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    const statusValidation = ValidationUtils.validatePropertyStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.message);
    }

    return await this.repository.updateStatus(id, status);
  }
}