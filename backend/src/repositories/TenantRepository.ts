/**
 * @deprecated This repository is deprecated. Use the new TenantRepository in src/features/tenants/tenant/data/repository/TenantRepository.ts
 * This file is kept only because RentPaymentService, RentTransactionService, etc. still depend on it.
 * Once those features are migrated, this file should be deleted.
 */
import { Pool } from 'pg';
import { Tenant, TenantDocument } from '../models/Tenant.js';
import { TABLES, COLUMNS } from '@/shared/constants/database.js';
import { ITenantRepository } from '../interfaces/repositories/ITenantRepository.js';

export class TenantRepository implements ITenantRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async findAll(): Promise<Tenant[]> {
    try {
      const result = await this.pool.query(`SELECT * FROM ${TABLES.TENANTS}`);
      return result.rows.map(row => this.mapRowToTenant(row));
    } catch (error: any) {
      throw new Error(`Failed to fetch tenants: ${error.message || 'Database query failed'}`);
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.TENANTS} WHERE ${COLUMNS.TENANTS.ID} = $1`,
        [id]
      );
      return result.rows[0] ? this.mapRowToTenant(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch tenant: ${error.message || 'Database query failed'}`);
    }
  }

  async findByEmail(email: string): Promise<Tenant | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.TENANTS} WHERE ${COLUMNS.TENANTS.EMAIL} = $1`,
        [email]
      );
      return result.rows[0] ? this.mapRowToTenant(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch tenant by email: ${error.message || 'Database query failed'}`);
    }
  }

  async findByPhone(phone: string): Promise<Tenant | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${TABLES.TENANTS} WHERE ${COLUMNS.TENANTS.PHONE} = $1`,
        [phone]
      );
      return result.rows[0] ? this.mapRowToTenant(result.rows[0]) : null;
    } catch (error: any) {
      throw new Error(`Failed to fetch tenant by phone: ${error.message || 'Database query failed'}`);
    }
  }

  async create(data: Omit<Tenant, 'id' | 'documents' | 'createdAt' | 'updatedAt'>): Promise<Tenant> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.TENANTS} (
          ${COLUMNS.TENANTS.FIRST_NAME},
          ${COLUMNS.TENANTS.LAST_NAME},
          ${COLUMNS.TENANTS.EMAIL},
          ${COLUMNS.TENANTS.PHONE},
          ${COLUMNS.TENANTS.ALTERNATE_PHONE},
          ${COLUMNS.TENANTS.DATE_OF_BIRTH},
          ${COLUMNS.TENANTS.GENDER},
          ${COLUMNS.TENANTS.OCCUPATION},
          ${COLUMNS.TENANTS.COMPANY_NAME},
          ${COLUMNS.TENANTS.MONTHLY_INCOME},
          ${COLUMNS.TENANTS.CURRENT_ADDRESS_STREET},
          ${COLUMNS.TENANTS.CURRENT_ADDRESS_CITY},
          ${COLUMNS.TENANTS.CURRENT_ADDRESS_STATE},
          ${COLUMNS.TENANTS.CURRENT_ADDRESS_PINCODE},
          ${COLUMNS.TENANTS.PERMANENT_ADDRESS_STREET},
          ${COLUMNS.TENANTS.PERMANENT_ADDRESS_CITY},
          ${COLUMNS.TENANTS.PERMANENT_ADDRESS_STATE},
          ${COLUMNS.TENANTS.PERMANENT_ADDRESS_PINCODE},
          ${COLUMNS.TENANTS.EMERGENCY_CONTACT_NAME},
          ${COLUMNS.TENANTS.EMERGENCY_CONTACT_RELATIONSHIP},
          ${COLUMNS.TENANTS.EMERGENCY_CONTACT_PHONE},
          ${COLUMNS.TENANTS.STATUS},
          ${COLUMNS.TENANTS.TOTAL_RENTALS},
          ${COLUMNS.TENANTS.CURRENT_PROPERTY_ID},
          ${COLUMNS.TENANTS.CREATED_AT},
          ${COLUMNS.TENANTS.UPDATED_AT}
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
        [
          data.firstName,
          data.lastName,
          data.email,
          data.phone,
          data.alternatePhone,
          data.dateOfBirth,
          data.gender,
          data.occupation,
          data.companyName,
          data.monthlyIncome,
          data.currentAddress.street,
          data.currentAddress.city,
          data.currentAddress.state,
          data.currentAddress.pincode,
          data.permanentAddress?.street || null,
          data.permanentAddress?.city || null,
          data.permanentAddress?.state || null,
          data.permanentAddress?.pincode || null,
          data.emergencyContact?.name || null,
          data.emergencyContact?.relationship || null,
          data.emergencyContact?.phone || null,
          data.status || 'active',
          data.totalRentals || 0,
          data.currentPropertyId,
          now,
          now
        ]
      );
      return this.mapRowToTenant(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<Tenant, 'id' | 'documents' | 'createdAt' | 'updatedAt'>>): Promise<Tenant | null> {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (data.firstName !== undefined) {
        fields.push(`${COLUMNS.TENANTS.FIRST_NAME} = $${paramIndex++}`);
        values.push(data.firstName);
      }
      if (data.lastName !== undefined) {
        fields.push(`${COLUMNS.TENANTS.LAST_NAME} = $${paramIndex++}`);
        values.push(data.lastName);
      }
      if (data.email !== undefined) {
        fields.push(`${COLUMNS.TENANTS.EMAIL} = $${paramIndex++}`);
        values.push(data.email);
      }
      if (data.phone !== undefined) {
        fields.push(`${COLUMNS.TENANTS.PHONE} = $${paramIndex++}`);
        values.push(data.phone);
      }
      if (data.alternatePhone !== undefined) {
        fields.push(`${COLUMNS.TENANTS.ALTERNATE_PHONE} = $${paramIndex++}`);
        values.push(data.alternatePhone);
      }
      if (data.dateOfBirth !== undefined) {
        fields.push(`${COLUMNS.TENANTS.DATE_OF_BIRTH} = $${paramIndex++}`);
        values.push(data.dateOfBirth);
      }
      if (data.gender !== undefined) {
        fields.push(`${COLUMNS.TENANTS.GENDER} = $${paramIndex++}`);
        values.push(data.gender);
      }
      if (data.occupation !== undefined) {
        fields.push(`${COLUMNS.TENANTS.OCCUPATION} = $${paramIndex++}`);
        values.push(data.occupation);
      }
      if (data.companyName !== undefined) {
        fields.push(`${COLUMNS.TENANTS.COMPANY_NAME} = $${paramIndex++}`);
        values.push(data.companyName);
      }
      if (data.monthlyIncome !== undefined) {
        fields.push(`${COLUMNS.TENANTS.MONTHLY_INCOME} = $${paramIndex++}`);
        values.push(data.monthlyIncome);
      }
      if (data.currentAddress?.street !== undefined) {
        fields.push(`${COLUMNS.TENANTS.CURRENT_ADDRESS_STREET} = $${paramIndex++}`);
        values.push(data.currentAddress.street);
      }
      if (data.currentAddress?.city !== undefined) {
        fields.push(`${COLUMNS.TENANTS.CURRENT_ADDRESS_CITY} = $${paramIndex++}`);
        values.push(data.currentAddress.city);
      }
      if (data.currentAddress?.state !== undefined) {
        fields.push(`${COLUMNS.TENANTS.CURRENT_ADDRESS_STATE} = $${paramIndex++}`);
        values.push(data.currentAddress.state);
      }
      if (data.currentAddress?.pincode !== undefined) {
        fields.push(`${COLUMNS.TENANTS.CURRENT_ADDRESS_PINCODE} = $${paramIndex++}`);
        values.push(data.currentAddress.pincode);
      }
      if (data.permanentAddress?.street !== undefined) {
        fields.push(`${COLUMNS.TENANTS.PERMANENT_ADDRESS_STREET} = $${paramIndex++}`);
        values.push(data.permanentAddress.street);
      }
      if (data.permanentAddress?.city !== undefined) {
        fields.push(`${COLUMNS.TENANTS.PERMANENT_ADDRESS_CITY} = $${paramIndex++}`);
        values.push(data.permanentAddress.city);
      }
      if (data.permanentAddress?.state !== undefined) {
        fields.push(`${COLUMNS.TENANTS.PERMANENT_ADDRESS_STATE} = $${paramIndex++}`);
        values.push(data.permanentAddress.state);
      }
      if (data.permanentAddress?.pincode !== undefined) {
        fields.push(`${COLUMNS.TENANTS.PERMANENT_ADDRESS_PINCODE} = $${paramIndex++}`);
        values.push(data.permanentAddress.pincode);
      }
      if (data.emergencyContact?.name !== undefined) {
        fields.push(`${COLUMNS.TENANTS.EMERGENCY_CONTACT_NAME} = $${paramIndex++}`);
        values.push(data.emergencyContact.name);
      }
      if (data.emergencyContact?.relationship !== undefined) {
        fields.push(`${COLUMNS.TENANTS.EMERGENCY_CONTACT_RELATIONSHIP} = $${paramIndex++}`);
        values.push(data.emergencyContact.relationship);
      }
      if (data.emergencyContact?.phone !== undefined) {
        fields.push(`${COLUMNS.TENANTS.EMERGENCY_CONTACT_PHONE} = $${paramIndex++}`);
        values.push(data.emergencyContact.phone);
      }
      if (data.status !== undefined) {
        fields.push(`${COLUMNS.TENANTS.STATUS} = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.totalRentals !== undefined) {
        fields.push(`${COLUMNS.TENANTS.TOTAL_RENTALS} = $${paramIndex++}`);
        values.push(data.totalRentals);
      }
      if (data.currentPropertyId !== undefined) {
        fields.push(`${COLUMNS.TENANTS.CURRENT_PROPERTY_ID} = $${paramIndex++}`);
        values.push(data.currentPropertyId);
      }

      if (fields.length === 0) {
        return await this.findById(id);
      }

      fields.push(`${COLUMNS.TENANTS.UPDATED_AT} = $${paramIndex++}`);
      values.push(new Date());

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.TENANTS} SET ${setClause} WHERE ${COLUMNS.TENANTS.ID} = $${paramIndex} RETURNING *`;
      values.push(id);

      const result = await this.pool.query(query, values);
      return result.rows[0] ? this.mapRowToTenant(result.rows[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `DELETE FROM ${TABLES.TENANTS} WHERE ${COLUMNS.TENANTS.ID} = $1`,
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      // Log the actual database error for debugging
      console.error('Database error during tenant deletion:', error);
      throw new Error(`Failed to delete tenant: ${error.message || 'Database constraint violation'}`);
    }
  }

  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const result = await this.pool.query(
        `UPDATE ${TABLES.TENANTS} SET ${COLUMNS.TENANTS.STATUS} = $1, ${COLUMNS.TENANTS.UPDATED_AT} = $2 WHERE ${COLUMNS.TENANTS.ID} = $3`,
        [status, new Date(), id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to update tenant status: ${error.message || 'Database update failed'}`);
    }
  }

  // Document management methods
  async addDocument(tenantId: string, document: Omit<TenantDocument, 'id' | 'tenantId' | 'uploadedAt'>): Promise<TenantDocument> {
    try {
      const now = new Date();
      const result = await this.pool.query(
        `INSERT INTO ${TABLES.TENANT_DOCUMENTS} (
          ${COLUMNS.TENANT_DOCUMENTS.TENANT_ID},
          ${COLUMNS.TENANT_DOCUMENTS.DOCUMENT_TYPE},
          ${COLUMNS.TENANT_DOCUMENTS.DOCUMENT_NAME},
          ${COLUMNS.TENANT_DOCUMENTS.DOCUMENT_NUMBER},
          ${COLUMNS.TENANT_DOCUMENTS.FILE_URL},
          ${COLUMNS.TENANT_DOCUMENTS.FILE_SIZE},
          ${COLUMNS.TENANT_DOCUMENTS.VERIFIED},
          ${COLUMNS.TENANT_DOCUMENTS.VERIFIED_AT},
          ${COLUMNS.TENANT_DOCUMENTS.VERIFIED_BY},
          ${COLUMNS.TENANT_DOCUMENTS.UPLOADED_AT}
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
        `SELECT * FROM ${TABLES.TENANT_DOCUMENTS} WHERE ${COLUMNS.TENANT_DOCUMENTS.TENANT_ID} = $1 ORDER BY ${COLUMNS.TENANT_DOCUMENTS.UPLOADED_AT} DESC`,
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
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.DOCUMENT_TYPE} = $${paramIndex++}`);
        values.push(data.documentType);
      }
      if (data.documentName !== undefined) {
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.DOCUMENT_NAME} = $${paramIndex++}`);
        values.push(data.documentName);
      }
      if (data.documentNumber !== undefined) {
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.DOCUMENT_NUMBER} = $${paramIndex++}`);
        values.push(data.documentNumber);
      }
      if (data.fileUrl !== undefined) {
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.FILE_URL} = $${paramIndex++}`);
        values.push(data.fileUrl);
      }
      if (data.fileSize !== undefined) {
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.FILE_SIZE} = $${paramIndex++}`);
        values.push(data.fileSize);
      }
      if (data.verified !== undefined) {
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.VERIFIED} = $${paramIndex++}`);
        values.push(data.verified);
      }
      if (data.verifiedAt !== undefined) {
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.VERIFIED_AT} = $${paramIndex++}`);
        values.push(data.verifiedAt);
      }
      if (data.verifiedBy !== undefined) {
        fields.push(`${COLUMNS.TENANT_DOCUMENTS.VERIFIED_BY} = $${paramIndex++}`);
        values.push(data.verifiedBy);
      }

      if (fields.length === 0) {
        const result = await this.pool.query(
          `SELECT * FROM ${TABLES.TENANT_DOCUMENTS} WHERE ${COLUMNS.TENANT_DOCUMENTS.ID} = $1`,
          [documentId]
        );
        return result.rows[0] ? this.mapRowToTenantDocument(result.rows[0]) : null;
      }

      const setClause = fields.join(', ');
      const query = `UPDATE ${TABLES.TENANT_DOCUMENTS} SET ${setClause} WHERE ${COLUMNS.TENANT_DOCUMENTS.ID} = $${paramIndex} RETURNING *`;
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
        `DELETE FROM ${TABLES.TENANT_DOCUMENTS} WHERE ${COLUMNS.TENANT_DOCUMENTS.ID} = $1`,
        [documentId]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete tenant document: ${error.message || 'Database delete failed'}`);
    }
  }

  private mapRowToTenant(row: any): Tenant {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phone: row.phone,
      alternatePhone: row.alternate_phone,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      gender: row.gender,
      occupation: row.occupation,
      companyName: row.company_name,
      monthlyIncome: row.monthly_income ? parseFloat(row.monthly_income) : undefined,
      currentAddress: {
        street: row.current_address_street,
        city: row.current_address_city,
        state: row.current_address_state,
        pincode: row.current_address_pincode,
      },
      permanentAddress: row.permanent_address_street ? {
        street: row.permanent_address_street,
        city: row.permanent_address_city,
        state: row.permanent_address_state,
        pincode: row.permanent_address_pincode,
      } : undefined,
      emergencyContact: row.emergency_contact_name ? {
        name: row.emergency_contact_name,
        relationship: row.emergency_contact_relationship,
        phone: row.emergency_contact_phone,
      } : undefined,
      documents: [], // Will be populated separately if needed
      status: row.status,
      totalRentals: row.total_rentals || 0,
      currentPropertyId: row.current_property_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
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