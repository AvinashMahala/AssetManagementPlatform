import { Meter } from '../../core/types/meter.types.js';

export class MeterMapper {
  static toDomain(row: any): Meter {
    return {
      id: row.id,
      unitId: row.unit_id,
      propertyId: row.property_id,
      meterType: row.meter_type,
      meterName: row.meter_name,
      meterNumber: row.meter_number,
      multiplier: parseFloat(row.multiplier) || 1.0,
      costPerUnit: parseFloat(row.cost_per_unit) || 0,
      fixedCharge: row.fixed_charge ? parseFloat(row.fixed_charge) : undefined,
      installationDate: row.installation_date ? new Date(row.installation_date) : undefined,
      status: row.status || 'active',
      remarks: row.remarks,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
