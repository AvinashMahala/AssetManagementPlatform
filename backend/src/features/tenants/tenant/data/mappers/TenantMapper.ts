import { Tenant, TenantStatus } from '../../core/types/tenant.types';
import { ITenantRow } from '../interfaces/ITenantRow';

export class TenantMapper {
  static toDomain(row: ITenantRow): Tenant {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      alternatePhone: row.alternate_phone,
      dateOfBirth: row.date_of_birth,
      gender: row.gender as any,
      occupation: row.occupation,
      companyName: row.company_name,
      monthlyIncome: row.monthly_income ? Number(row.monthly_income) : undefined,
      currentAddress: {
        street: row.current_address_street,
        city: row.current_address_city,
        state: row.current_address_state,
        pincode: row.current_address_pincode,
      },
      permanentAddress: row.permanent_address_street ? {
        street: row.permanent_address_street,
        city: row.permanent_address_city!,
        state: row.permanent_address_state!,
        pincode: row.permanent_address_pincode!,
      } : undefined,
      emergencyContact: row.emergency_contact_name ? {
        name: row.emergency_contact_name,
        relationship: row.emergency_contact_relationship!,
        phone: row.emergency_contact_phone!,
      } : undefined,
      status: row.status as TenantStatus,
      totalRentals: row.total_rentals,
      currentPropertyId: row.current_property_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
