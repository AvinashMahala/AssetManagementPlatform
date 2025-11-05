import { IPropertyRepository } from '../interfaces/repositories/IPropertyRepository.js';
import { Property, PropertyInput, PropertyStatus } from '../models/Property.js';
import { ValidationUtils } from '../utils/validation.js';
import { ERROR_MESSAGES } from '../constants/validation.js';
import { IPropertyService } from '../interfaces/services/IPropertyService.js';
import { ReceiptTemplateService } from './ReceiptTemplateService.js';
import { ReceiptTemplateSettings } from '../models/ReceiptTemplate.js';

export class PropertyService implements IPropertyService {
  private repository: IPropertyRepository;
  private templateService: ReceiptTemplateService;

  constructor(repository: IPropertyRepository, templateService: ReceiptTemplateService) {
    this.repository = repository;
    this.templateService = templateService;
  }

  async getAllProperties(): Promise<Property[]> {
    return await this.repository.findAll();
  }

  async getPropertyById(id: string): Promise<Property | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }
    return await this.repository.findById(id);
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    if (!ownerId || ownerId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.OWNER_REQUIRED);
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
    if (propertyData.description !== undefined) {
      const descriptionValidation = ValidationUtils.validatePropertyDescription(propertyData.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    // Validate property type
    const typeValidation = ValidationUtils.validatePropertyType(propertyData.propertyType);
    if (!typeValidation.isValid) {
      throw new Error(typeValidation.message);
    }

    // Validate property status
    if (propertyData.status !== undefined) {
      const statusValidation = ValidationUtils.validatePropertyStatus(propertyData.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    // Validate total area
    const areaValidation = ValidationUtils.validatePropertyArea(propertyData.totalArea);
    if (!areaValidation.isValid) {
      throw new Error(areaValidation.message);
    }

    // Validate address
    const addressValidation = ValidationUtils.validatePropertyAddress(propertyData.address);
    if (!addressValidation.isValid) {
      throw new Error(addressValidation.message);
    }

    // Validate owner
    if (!propertyData.ownerId || propertyData.ownerId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.OWNER_REQUIRED);
    }

    // Validate building amenities
    if (propertyData.buildingAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateAmenities(propertyData.buildingAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    // Validate building photos
    if (propertyData.buildingPhotos !== undefined) {
      const photosValidation = ValidationUtils.validatePhotos(propertyData.buildingPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    // Ensure optional fields have proper defaults
    const propertyDataWithDefaults: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
      name: propertyData.name,
      description: propertyData.description,
      propertyType: propertyData.propertyType,
      status: propertyData.status || PropertyStatus.AVAILABLE,
      address: propertyData.address,
      totalArea: propertyData.totalArea,
      totalFloors: propertyData.totalFloors,
      yearBuilt: propertyData.yearBuilt,
      parkingSpaces: propertyData.parkingSpaces,
      buildingAmenities: propertyData.buildingAmenities || [],
      buildingPhotos: propertyData.buildingPhotos || [],
      ownerId: propertyData.ownerId,
      coOwners: propertyData.coOwners || [],
    };

    return await this.repository.create(propertyDataWithDefaults);
  }

  async updateProperty(id: string, propertyData: Partial<PropertyInput>): Promise<Property | null> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
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

    if (propertyData.totalArea !== undefined) {
      const areaValidation = ValidationUtils.validatePropertyArea(propertyData.totalArea);
      if (!areaValidation.isValid) {
        throw new Error(areaValidation.message);
      }
    }

    if (propertyData.address !== undefined) {
      const addressValidation = ValidationUtils.validatePropertyAddress(propertyData.address);
      if (!addressValidation.isValid) {
        throw new Error(addressValidation.message);
      }
    }

    if (propertyData.ownerId !== undefined) {
      if (!propertyData.ownerId || propertyData.ownerId.trim().length === 0) {
        throw new Error(ERROR_MESSAGES.PROPERTY.OWNER_REQUIRED);
      }
    }

    if (propertyData.buildingAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateAmenities(propertyData.buildingAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    if (propertyData.buildingPhotos !== undefined) {
      const photosValidation = ValidationUtils.validatePhotos(propertyData.buildingPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    return await this.repository.update(id, propertyData);
  }

  async deleteProperty(id: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    return await this.repository.delete(id);
  }

  async updatePropertyStatus(id: string, status: string): Promise<boolean> {
    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    const statusValidation = ValidationUtils.validatePropertyStatus(status);
    if (!statusValidation.isValid) {
      throw new Error(statusValidation.message);
    }

    return await this.repository.updateStatus(id, status);
  }

  // Template management methods
  async getPropertyTemplateSettings(propertyId: string): Promise<ReceiptTemplateSettings | null> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    return await this.templateService.getPropertyTemplateSettings(propertyId);
  }

  async setPropertyTemplate(propertyId: string, templateId: string, overrides?: Partial<ReceiptTemplateSettings>): Promise<boolean> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    if (!templateId || templateId.trim().length === 0) {
      throw new Error('Template ID is required');
    }

    return await this.templateService.setPropertyTemplate(propertyId, templateId, overrides);
  }

  async removePropertyTemplate(propertyId: string): Promise<boolean> {
    if (!propertyId || propertyId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    // Set templateId to null and clear overrides
    return await this.repository.update(propertyId, {
      templateId: undefined,
      templateOverrides: undefined
    }) !== null;
  }
}