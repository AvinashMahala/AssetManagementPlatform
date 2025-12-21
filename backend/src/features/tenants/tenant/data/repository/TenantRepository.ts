import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { ITenantRepository } from '../../core/interfaces/ITenantRepository';
import { Tenant, CreateTenantDTO, UpdateTenantDTO } from '../../core/types/tenant.types';
import { ITenantRow } from '../interfaces/ITenantRow';
import { TenantMapper } from '../mappers/TenantMapper';

export class TenantRepository extends BaseRepository<Tenant, ITenantRow, Partial<ITenantRow>> implements ITenantRepository {
  constructor(pool: Pool) {
    super(pool, 'tenants');
  }

  protected override mapToDomain(row: any): Tenant {
    return TenantMapper.toDomain(row);
  }

  async findAll(): Promise<Tenant[]> {
    return super.findAll();
  }

  async findById(id: string): Promise<Tenant | null> {
    return super.findById(id);
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    return this.findOne({ email });
  }

  async create(data: CreateTenantDTO): Promise<Tenant> {
    const rowData: Partial<ITenantRow> = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      alternate_phone: data.alternatePhone,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      occupation: data.occupation,
      company_name: data.companyName,
      monthly_income: data.monthlyIncome,
      current_address_street: data.currentAddress.street,
      current_address_city: data.currentAddress.city,
      current_address_state: data.currentAddress.state,
      current_address_pincode: data.currentAddress.pincode,
      permanent_address_street: data.permanentAddress?.street,
      permanent_address_city: data.permanentAddress?.city,
      permanent_address_state: data.permanentAddress?.state,
      permanent_address_pincode: data.permanentAddress?.pincode,
      emergency_contact_name: data.emergencyContact?.name,
      emergency_contact_relationship: data.emergencyContact?.relationship,
      emergency_contact_phone: data.emergencyContact?.phone,
      status: data.status,
    };

    const row = await this.add(rowData as ITenantRow);
    return this.mapToDomain(row);
  }

  async update(id: string, data: UpdateTenantDTO): Promise<Tenant | null> {
    const rowData: Partial<ITenantRow> = {};
    
    if (data.firstName) rowData.first_name = data.firstName;
    if (data.lastName) rowData.last_name = data.lastName;
    if (data.email) rowData.email = data.email;
    if (data.phone) rowData.phone = data.phone;
    if (data.alternatePhone) rowData.alternate_phone = data.alternatePhone;
    if (data.dateOfBirth) rowData.date_of_birth = data.dateOfBirth;
    if (data.gender) rowData.gender = data.gender;
    if (data.occupation) rowData.occupation = data.occupation;
    if (data.companyName) rowData.company_name = data.companyName;
    if (data.monthlyIncome) rowData.monthly_income = data.monthlyIncome;
    
    if (data.currentAddress) {
      rowData.current_address_street = data.currentAddress.street;
      rowData.current_address_city = data.currentAddress.city;
      rowData.current_address_state = data.currentAddress.state;
      rowData.current_address_pincode = data.currentAddress.pincode;
    }

    if (data.permanentAddress) {
      rowData.permanent_address_street = data.permanentAddress.street;
      rowData.permanent_address_city = data.permanentAddress.city;
      rowData.permanent_address_state = data.permanentAddress.state;
      rowData.permanent_address_pincode = data.permanentAddress.pincode;
    }

    if (data.emergencyContact) {
      rowData.emergency_contact_name = data.emergencyContact.name;
      rowData.emergency_contact_relationship = data.emergencyContact.relationship;
      rowData.emergency_contact_phone = data.emergencyContact.phone;
    }

    if (data.status) rowData.status = data.status;

    return super.updateById(id, rowData);
  }

  async delete(id: string): Promise<boolean> {
    return super.delete(id);
  }
}
