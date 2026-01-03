import { Unit, UnitType, UnitStatus } from '../../core/types/unit.types.js';
import { IUnitRow } from '../interfaces/IUnitRow.js';

export class UnitMapper {
  static toDomain(row: IUnitRow): Unit {
    return {
      id: row.id,
      propertyId: row.property_id,
      unitNumber: row.unit_number,
      unitName: row.unit_name,
      description: row.description,
      unitType: row.unit_type as UnitType,
      status: row.status as UnitStatus,
      floor: row.floor,
      area: Number(row.area),
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      balconies: row.balconies,
      furnished: row.furnished,
      maxOccupants: row.max_occupants,
      unitAmenities: row.unit_amenities || [],
      unitPhotos: row.unit_photos || [],
      monthlyRent: Number(row.monthly_rent),
      securityDeposit: Number(row.security_deposit),
      maintenanceCharges: row.maintenance_charges ? Number(row.maintenance_charges) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      utilities: [] // Utilities are loaded separately if needed
    };
  }

  static toPersistence(unit: Partial<Unit>): Partial<IUnitRow> {
    const row: any = {};
    
    if (unit.id) row.id = unit.id;
    if (unit.propertyId) row.property_id = unit.propertyId;
    if (unit.unitNumber) row.unit_number = unit.unitNumber;
    if (unit.unitName !== undefined) row.unit_name = unit.unitName;
    if (unit.description !== undefined) row.description = unit.description;
    if (unit.unitType) row.unit_type = unit.unitType;
    if (unit.status) row.status = unit.status;
    if (unit.floor !== undefined) row.floor = unit.floor;
    if (unit.area !== undefined) row.area = unit.area;
    if (unit.bedrooms !== undefined) row.bedrooms = unit.bedrooms;
    if (unit.bathrooms !== undefined) row.bathrooms = unit.bathrooms;
    if (unit.balconies !== undefined) row.balconies = unit.balconies;
    if (unit.furnished !== undefined) row.furnished = unit.furnished;
    if (unit.maxOccupants !== undefined) row.max_occupants = unit.maxOccupants;
    if (unit.unitAmenities) row.unit_amenities = unit.unitAmenities;
    if (unit.unitPhotos) row.unit_photos = unit.unitPhotos;
    if (unit.monthlyRent !== undefined) row.monthly_rent = unit.monthlyRent;
    if (unit.securityDeposit !== undefined) row.security_deposit = unit.securityDeposit;
    if (unit.maintenanceCharges !== undefined) row.maintenance_charges = unit.maintenanceCharges;
    if (unit.createdAt) row.created_at = unit.createdAt;
    if (unit.updatedAt) row.updated_at = unit.updatedAt;

    return row;
  }
}
