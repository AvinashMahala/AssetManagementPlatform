import { IUseCase } from '@/shared/core/IUseCase.js';
import { IPropertyRepository } from '../interfaces/IPropertyRepository.js';
import { Property, PropertyInput, PropertyStatus } from '../types/property.types.js';
import { ValidationUtils } from '@/shared/utils/validation.js';
import { ERROR_MESSAGES } from '@/shared/constants/validation.js';

export class CreatePropertyUseCase implements IUseCase<PropertyInput, Property> {
  constructor(private repository: IPropertyRepository) {}

  async execute(data: PropertyInput): Promise<Property> {
    // Backwards compatibility: some clients may send `area` instead of `totalArea`.
    // Normalize incoming data so validation below works consistently.
    const legacyArea = (data as any).area;
    if ((data as any).totalArea === undefined && legacyArea !== undefined) {
      const parsed = typeof legacyArea === 'string' ? parseFloat(legacyArea) : legacyArea;
      (data as any).totalArea = parsed;
    }
    // Validate property name
    const nameValidation = ValidationUtils.validatePropertyName(data.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.message);
    }

    // Validate property description
    if (data.description !== undefined) {
      const descriptionValidation = ValidationUtils.validatePropertyDescription(data.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    // Validate property type
    const typeValidation = ValidationUtils.validatePropertyType(data.propertyType);
    if (!typeValidation.isValid) {
      throw new Error(typeValidation.message);
    }

    // Validate property status
    if (data.status !== undefined) {
      const statusValidation = ValidationUtils.validatePropertyStatus(data.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    // Validate total area
    const areaValidation = ValidationUtils.validatePropertyArea(data.totalArea);
    if (!areaValidation.isValid) {
      throw new Error(areaValidation.message);
    }

    // Validate address
    const addressValidation = ValidationUtils.validatePropertyAddress(data.address);
    if (!addressValidation.isValid) {
      throw new Error(addressValidation.message);
    }

    // Validate owner
    if (!data.ownerId || data.ownerId.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.OWNER_REQUIRED);
    }

    // Validate building amenities
    if (data.buildingAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateAmenities(data.buildingAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    // Validate building photos
    if (data.buildingPhotos !== undefined) {
      const photosValidation = ValidationUtils.validatePhotos(data.buildingPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    const propertyData = {
      ...data,
      status: data.status || PropertyStatus.AVAILABLE,
      currency: data.currency || 'INR',
      address: {
        ...data.address,
        country: data.address.country || 'India'
      },
      buildingAmenities: data.buildingAmenities || [],
      buildingPhotos: data.buildingPhotos || [],
      amenities: data.amenities || {
        basic: [],
        luxury: [],
        additionalInfo: {
          petFriendly: false,
          smokingAllowed: false,
          eventsAllowed: false
        }
      }
    };
    return this.repository.create(propertyData);
  }
}
