import { Pool } from 'pg';
import { BaseRepository } from '@/shared/infrastructure/database/BaseRepository';
import { ITenantRepository } from './interfaces/ITenantRepository';
import { Tenant, CreateTenantDTO, UpdateTenantDTO, TenantDocument } from '../models/tenant.types';
import { TenantRow } from './types/TenantRow';
import { TenantMapper } from './mappers/TenantMapper';

export class TenantRepository extends BaseRepository<Tenant, TenantRow, Partial<TenantRow>> implements ITenantRepository {
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

  async findByPhone(phone: string): Promise<Tenant | null> {
    return this.findOne({ phone });
  }

  async create(data: CreateTenantDTO): Promise<Tenant> {
    const rowData: Partial<TenantRow> = {
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
      current_property_id: data.currentPropertyId,
    };

    const row = await this.add(rowData as TenantRow);
    return this.mapToDomain(row);
  }

  async update(id: string, data: UpdateTenantDTO): Promise<Tenant | null> {
    const rowData: Partial<TenantRow> = {};
    
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
    if (data.currentPropertyId) rowData.current_property_id = data.currentPropertyId;

    return super.updateById(id, rowData);
  }

  async delete(id: string): Promise<boolean> {
    return super.delete(id);
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE ${this.tableName} SET status = $1, updated_at = $2 WHERE id = $3`,
      [status, new Date(), id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  // Document management methods
  async addDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO tenant_documents (
          tenant_id,
          document_type,
          document_name,
          document_number,
          file_url,
          file_size,
          verified,
          verified_at,
          verified_by,
          uploaded_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          tenantId,
          document.documentType,
          document.documentName,
          document.documentNumber,
          document.fileUrl,
          document.fileSize,
          document.verified || false,
          document.verifiedAt,
          document.verifiedBy,
          now
        ]
      );
      return this.mapRowToTenantDocument(result.rows[0]);
    } catch (error: any) {
      throw new Error(`Failed to add tenant document: ${error.message || 'Database insert failed'}`);
    }
  }

  async getDocuments(tenantId: string): Promise<TenantDocument[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM tenant_documents WHERE tenant_id = $1 ORDER BY uploaded_at DESC`,
        [tenantId]
      );
      return result.rows.map(row => this.mapRowToTenantDocument(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch tenant documents: ${error.message || 'Database query failed'}`);
    }
  }

  async updateDocument(documentId: string, data: Partial<TenantDocument>): Promise<TenantDocument | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.documentType !== undefined) {
        fields.push(`document_type = $${paramIndex++}`);
        values.push(data.documentType);
      }
      if (data.documentName !== undefined) {
        fields.push(`document_name = $${paramIndex++}`);
        values.push(data.documentName);
      }
      if (data.documentNumber !== undefined) {
        fields.push(`document_number = $${paramIndex++}`);
        values.push(data.documentNumber);
      }
      if (data.fileUrl !== undefined) {
        fields.push(`file_url = $${paramIndex++}`);
        values.push(data.fileUrl);
      }
      if (data.fileSize !== undefined) {
        fields.push(`file_size = $${paramIndex++}`);
        values.push(data.fileSize);
      }
      if (data.verified !== undefined) {
        fields.push(`verified = $${paramIndex++}`);
        values.push(data.verified);
      }
      if (data.verifiedAt !== undefined) {
        fields.push(`verified_at = $${paramIndex++}`);
        values.push(data.verifiedAt);
      }
      if (data.verifiedBy !== undefined) {
        fields.push(`verified_by = $${paramIndex++}`);
        values.push(data.verifiedBy);
      }

      if (fields.length === 0) {
        const result = await this.pool.query(
          `SELECT * FROM tenant_documents WHERE id = $1`,
          [documentId]
        );
        return result.rows[0] ? this.mapRowToTenantDocument(result.rows[0]) : null;
      }

      const setClause = fields.join(', ');
      const query = `UPDATE tenant_documents SET ${setClause} WHERE id = $${paramIndex} RETURNING *`;
      values.push(documentId);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToTenantDocument(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to update tenant document: ${error.message || 'Database update failed'}`);
    }
  }

  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM tenant_documents WHERE id = $1`,
        [documentId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete tenant document: ${error.message || 'Database delete failed'}`);
    }
  }

  private mapRowToTenantDocument(row: any): TenantDocument {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      documentType: row.document_type,
      documentName: row.document_name,
      documentNumber: row.document_number,
      fileUrl: row.file_url,
      fileSize: row.file_size,
      verified: row.verified,
      verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
      verifiedBy: row.verified_by,
      uploadedAt: new Date(row.uploaded_at),
    };
  }
}
