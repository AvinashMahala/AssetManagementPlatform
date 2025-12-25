import { IUseCase } from '@/shared/core/IUseCase.js';
import { IPropertyRepository } from '../interfaces/IPropertyRepository.js';
import { Property, PropertyInput } from '../types/property.types.js';
import { PropertyNotFoundError } from '../errors/PropertyNotFoundError.js';
import { ValidationUtils } from '@/shared/utils/validation.js';
import { ERROR_MESSAGES } from '@/shared/constants/validation.js';

export class UpdatePropertyUseCase implements IUseCase<{ id: string; data: Partial<PropertyInput> }, Property> {
  constructor(private repository: IPropertyRepository) {}

  async execute(request: { id: string; data: Partial<PropertyInput> }): Promise<Property> {
    const { id, data } = request;

    if (!id || id.trim().length === 0) {
      throw new Error(ERROR_MESSAGES.PROPERTY.INVALID_ID);
    }

    // Validate fields if they are being updated
    if (data.name !== undefined) {
      const nameValidation = ValidationUtils.validatePropertyName(data.name);
      if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
      }
    }

    if (data.description !== undefined) {
      const descriptionValidation = ValidationUtils.validatePropertyDescription(data.description);
      if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
      }
    }

    if (data.propertyType !== undefined) {
      const typeValidation = ValidationUtils.validatePropertyType(data.propertyType);
      if (!typeValidation.isValid) {
        throw new Error(typeValidation.message);
      }
    }

    if (data.status !== undefined) {
      const statusValidation = ValidationUtils.validatePropertyStatus(data.status);
      if (!statusValidation.isValid) {
        throw new Error(statusValidation.message);
      }
    }

    // Backwards compatibility: accept legacy `area` field in update payloads
    const legacyArea = (data as any).area;
    if ((data as any).totalArea === undefined && legacyArea !== undefined) {
      const parsed = typeof legacyArea === 'string' ? parseFloat(legacyArea) : legacyArea;
      (data as any).totalArea = parsed;
    }

    if (data.totalArea !== undefined) {
      const areaValidation = ValidationUtils.validatePropertyArea(data.totalArea);
      if (!areaValidation.isValid) {
        throw new Error(areaValidation.message);
      }
    }

    if (data.address !== undefined) {
      const addressValidation = ValidationUtils.validatePropertyAddress(data.address);
      if (!addressValidation.isValid) {
        throw new Error(addressValidation.message);
      }
    }

    if (data.ownerId !== undefined) {
      if (!data.ownerId || data.ownerId.trim().length === 0) {
        throw new Error(ERROR_MESSAGES.PROPERTY.OWNER_REQUIRED);
      }
    }

    if (data.buildingAmenities !== undefined) {
      const amenitiesValidation = ValidationUtils.validateAmenities(data.buildingAmenities);
      if (!amenitiesValidation.isValid) {
        throw new Error(amenitiesValidation.message);
      }
    }

    if (data.buildingPhotos !== undefined) {
      const photosValidation = ValidationUtils.validatePhotos(data.buildingPhotos);
      if (!photosValidation.isValid) {
        throw new Error(photosValidation.message);
      }
    }

    const property = await this.repository.update(id, data);
    if (!property) {
      throw new PropertyNotFoundError(id);
    }
    return property;
  }
}
