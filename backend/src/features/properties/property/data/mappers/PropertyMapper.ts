import { Property, PropertyInput, PropertyType, PropertyStatus } from '../../core/types/property.types.js';
import { IPropertyRow } from '../interfaces/IPropertyRow.js';

export class PropertyMapper {
  static toDomain(row: IPropertyRow): Property {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      propertyType: row.property_type as PropertyType,
      status: row.status as PropertyStatus,
      currency: row.currency || 'INR',
      address: {
        street: row.address_street,
        city: row.address_city,
        state: row.address_state,
        pincode: row.address_pincode,
        country: row.address_country || 'India',
        landmark: row.address_landmark,
      },
      totalArea: typeof row.area === 'string' ? parseFloat(row.area) : row.area || 0,
      totalFloors: row.total_floors,
      yearBuilt: row.year_built,
      parkingSpaces: row.parking_spaces,
      buildingAmenities: Array.isArray(row.amenities) ? row.amenities : (typeof row.amenities === 'string' ? (JSON.parse(row.amenities).basic || []) : []),
      buildingPhotos: [], // Photos are stored in separate property_files table
      ownerId: row.owner_id,
      coOwners: Array.isArray(row.co_owners) ? row.co_owners : (typeof row.co_owners === 'string' ? JSON.parse(row.co_owners || '[]') : (row.co_owners || [])),
      receiptSettings: row.receipt_settings ? (typeof row.receipt_settings === 'string' ? JSON.parse(row.receipt_settings) : row.receipt_settings) : undefined,
      templateId: row.template_id,
      templateOverrides: row.template_overrides ? (typeof row.template_overrides === 'string' ? JSON.parse(row.template_overrides) : row.template_overrides) : undefined,
      ownerDetails: {
        name: row.owner_name,
        mobileNumbers: Array.isArray(row.owner_mobile_numbers) ? row.owner_mobile_numbers : (typeof row.owner_mobile_numbers === 'string' ? JSON.parse(row.owner_mobile_numbers || '[]') : (row.owner_mobile_numbers || [])),
        emailIds: Array.isArray(row.owner_email_ids) ? row.owner_email_ids : (typeof row.owner_email_ids === 'string' ? JSON.parse(row.owner_email_ids || '[]') : (row.owner_email_ids || [])),
        website: row.owner_website,
      },
      amenities: row.amenities ? (typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities) : {
        basic: [],
        luxury: [],
        additionalInfo: {
          petFriendly: false,
          smokingAllowed: false,
          eventsAllowed: false,
        },
      },
      receiptTemplate: undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  static toPersistence(property: Partial<PropertyInput> & { id?: string, createdAt?: Date, updatedAt?: Date }): Partial<IPropertyRow> {
    const row: any = {};

    if (property.id) row.id = property.id;
    if (property.name) row.name = property.name;
    if (property.description !== undefined) row.description = property.description;
    if (property.propertyType) row.property_type = property.propertyType;
    if (property.status) row.status = property.status;
    if (property.currency) row.currency = property.currency;
    
    if (property.address) {
      if (property.address.street) row.address_street = property.address.street;
      if (property.address.city) row.address_city = property.address.city;
      if (property.address.state) row.address_state = property.address.state;
      if (property.address.pincode) row.address_pincode = property.address.pincode;
      if (property.address.country) row.address_country = property.address.country;
      if (property.address.landmark !== undefined) row.address_landmark = property.address.landmark;
    }

    if (property.totalArea) row.area = property.totalArea;
    if (property.totalFloors !== undefined) row.total_floors = property.totalFloors;
    if (property.yearBuilt !== undefined) row.year_built = property.yearBuilt;
    if (property.parkingSpaces !== undefined) row.parking_spaces = property.parkingSpaces;
    
    if (property.amenities) row.amenities = JSON.stringify(property.amenities);
    
    if (property.ownerId) row.owner_id = property.ownerId;
    if (property.coOwners) row.co_owners = JSON.stringify(property.coOwners);
    
    if (property.receiptSettings !== undefined) row.receipt_settings = property.receiptSettings ? JSON.stringify(property.receiptSettings) : null;
    if (property.templateId !== undefined) row.template_id = property.templateId;
    if (property.templateOverrides !== undefined) row.template_overrides = property.templateOverrides ? JSON.stringify(property.templateOverrides) : null;
    
    if (property.ownerDetails) {
      if (property.ownerDetails.name) row.owner_name = property.ownerDetails.name;
      if (property.ownerDetails.mobileNumbers) row.owner_mobile_numbers = JSON.stringify(property.ownerDetails.mobileNumbers);
      if (property.ownerDetails.emailIds) row.owner_email_ids = JSON.stringify(property.ownerDetails.emailIds);
      if (property.ownerDetails.website !== undefined) row.owner_website = property.ownerDetails.website;
    }

    if (property.createdAt) row.created_at = property.createdAt;
    if (property.updatedAt) row.updated_at = property.updatedAt;

    return row;
  }
}
