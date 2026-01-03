import { Pool } from 'pg';
import { IPropertyReceiptTemplateRepository } from '../../core/interfaces/IPropertyReceiptTemplateRepository';
import { PropertyReceiptTemplate } from '../../core/types/property.types';

export class PropertyReceiptTemplateRepository implements IPropertyReceiptTemplateRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(templateData: Omit<PropertyReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyReceiptTemplate> {
    try {
      const query = `
        INSERT INTO property_receipt_templates (
          property_id, bank_name, account_number, ifsc_code, account_holder_name,
          wallets, payment_qr_code_url, signature_url, watermark_url, additional_info
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const values = [
        templateData.propertyId,
        templateData.bankDetails?.bankName,
        templateData.bankDetails?.accountNumber,
        templateData.bankDetails?.ifscCode,
        templateData.bankDetails?.accountHolderName,
        JSON.stringify(templateData.wallets || []),
        templateData.paymentQRCodeUrl,
        templateData.signatureUrl,
        templateData.watermarkUrl,
        JSON.stringify(templateData.additionalInfo || {})
      ];

      const result = await this.pool.query(query, values);
      return this.mapRowToPropertyReceiptTemplate(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to create property receipt template: ${(error as Error).message || 'Database insert failed'}`);
    }
  }

  async getByPropertyId(propertyId: string): Promise<PropertyReceiptTemplate | null> {
    try {
      const query = `SELECT * FROM property_receipt_templates WHERE property_id = $1`;
      const result = await this.pool.query(query, [propertyId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.mapRowToPropertyReceiptTemplate(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to get property receipt template: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  async update(propertyId: string, updates: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>): Promise<PropertyReceiptTemplate | null> {
    try {
      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.bankDetails) {
        if (updates.bankDetails.bankName !== undefined) {
          setClause.push(`bank_name = $${paramIndex++}`);
          values.push(updates.bankDetails.bankName);
        }
        if (updates.bankDetails.accountNumber !== undefined) {
          setClause.push(`account_number = $${paramIndex++}`);
          values.push(updates.bankDetails.accountNumber);
        }
        if (updates.bankDetails.ifscCode !== undefined) {
          setClause.push(`ifsc_code = $${paramIndex++}`);
          values.push(updates.bankDetails.ifscCode);
        }
        if (updates.bankDetails.accountHolderName !== undefined) {
          setClause.push(`account_holder_name = $${paramIndex++}`);
          values.push(updates.bankDetails.accountHolderName);
        }
      }

      if (updates.wallets !== undefined) {
        setClause.push(`wallets = $${paramIndex++}`);
        values.push(JSON.stringify(updates.wallets));
      }

      if (updates.paymentQRCodeUrl !== undefined) {
        setClause.push(`payment_qr_code_url = $${paramIndex++}`);
        values.push(updates.paymentQRCodeUrl);
      }

      if (updates.signatureUrl !== undefined) {
        setClause.push(`signature_url = $${paramIndex++}`);
        values.push(updates.signatureUrl);
      }

      if (updates.watermarkUrl !== undefined) {
        setClause.push(`watermark_url = $${paramIndex++}`);
        values.push(updates.watermarkUrl);
      }

      if (updates.additionalInfo !== undefined) {
        setClause.push(`additional_info = $${paramIndex++}`);
        values.push(JSON.stringify(updates.additionalInfo));
      }

      if (setClause.length === 0) {
        return this.getByPropertyId(propertyId);
      }

      values.push(propertyId);
      const query = `
        UPDATE property_receipt_templates
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE property_id = $${paramIndex}
        RETURNING *
      `;

      const result = await this.pool.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPropertyReceiptTemplate(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update property receipt template: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  async delete(propertyId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM property_receipt_templates WHERE property_id = $1`;
      const result = await this.pool.query(query, [propertyId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to delete property receipt template: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  async existsForProperty(propertyId: string): Promise<boolean> {
    try {
      const query = `SELECT 1 FROM property_receipt_templates WHERE property_id = $1`;
      const result = await this.pool.query(query, [propertyId]);
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      throw new Error(`Failed to check if property receipt template exists: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  private async getById(id: string): Promise<PropertyReceiptTemplate | null> {
    const query = `SELECT * FROM property_receipt_templates WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] ? this.mapRowToPropertyReceiptTemplate(result.rows[0]) : null;
  }

  private mapRowToPropertyReceiptTemplate(row: any): PropertyReceiptTemplate {
    return {
      id: row.id,
      propertyId: row.property_id,
      bankDetails: {
        bankName: row.bank_name,
        accountNumber: row.account_number,
        ifscCode: row.ifsc_code,
        accountHolderName: row.account_holder_name
      },
      wallets: typeof row.wallets === 'string' ? JSON.parse(row.wallets) : row.wallets,
      paymentQRCodeUrl: row.payment_qr_code_url,
      signatureUrl: row.signature_url,
      watermarkUrl: row.watermark_url,
      additionalInfo: typeof row.additional_info === 'string' ? JSON.parse(row.additional_info) : row.additional_info,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
