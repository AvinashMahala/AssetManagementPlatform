import { Pool } from 'pg';
import { PropertyReceiptTemplate } from '../models/Property';
import { IPropertyReceiptTemplateRepository } from '../interfaces/repositories/IPropertyReceiptTemplateRepository';

export class PropertyReceiptTemplateRepository implements IPropertyReceiptTemplateRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Create a new property receipt template
   */
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

  /**
   * Get receipt template by property ID
   */
  async getByPropertyId(propertyId: string): Promise<PropertyReceiptTemplate | null> {
    try {
      const query = `SELECT * FROM property_receipt_templates WHERE property_id = $1`;

      const result = await this.pool.query(query, [propertyId]);
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPropertyReceiptTemplate(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to get property receipt template by property ID: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  /**
   * Update receipt template
   */
  async update(propertyId: string, updates: Partial<Omit<PropertyReceiptTemplate, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>>): Promise<PropertyReceiptTemplate | null> {
    try {
      const setParts: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.bankDetails) {
        if (updates.bankDetails.bankName !== undefined) {
          setParts.push(`bank_name = $${paramIndex++}`);
          values.push(updates.bankDetails.bankName);
        }
        if (updates.bankDetails.accountNumber !== undefined) {
          setParts.push(`account_number = $${paramIndex++}`);
          values.push(updates.bankDetails.accountNumber);
        }
        if (updates.bankDetails.ifscCode !== undefined) {
          setParts.push(`ifsc_code = $${paramIndex++}`);
          values.push(updates.bankDetails.ifscCode);
        }
        if (updates.bankDetails.accountHolderName !== undefined) {
          setParts.push(`account_holder_name = $${paramIndex++}`);
          values.push(updates.bankDetails.accountHolderName);
        }
      }

      if (updates.wallets !== undefined) {
        setParts.push(`wallets = $${paramIndex++}`);
        values.push(JSON.stringify(updates.wallets));
      }

      if (updates.paymentQRCodeUrl !== undefined) {
        setParts.push(`payment_qr_code_url = $${paramIndex++}`);
        values.push(updates.paymentQRCodeUrl);
      }

      if (updates.signatureUrl !== undefined) {
        setParts.push(`signature_url = $${paramIndex++}`);
        values.push(updates.signatureUrl);
      }

      if (updates.watermarkUrl !== undefined) {
        setParts.push(`watermark_url = $${paramIndex++}`);
        values.push(updates.watermarkUrl);
      }

      if (updates.additionalInfo !== undefined) {
        setParts.push(`additional_info = $${paramIndex++}`);
        values.push(JSON.stringify(updates.additionalInfo));
      }

      if (setParts.length === 0) {
        return null;
      }

      const query = `
        UPDATE property_receipt_templates
        SET ${setParts.join(', ')}
        WHERE property_id = $${paramIndex}
        RETURNING *
      `;

      values.push(propertyId);

      const result = await this.pool.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPropertyReceiptTemplate(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to update property receipt template: ${(error as Error).message || 'Database update failed'}`);
    }
  }

  /**
   * Delete receipt template by property ID
   */
  async deleteByPropertyId(propertyId: string): Promise<boolean> {
    try {
      const query = `DELETE FROM property_receipt_templates WHERE property_id = $1 RETURNING property_id`;

      const result = await this.pool.query(query, [propertyId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to delete property receipt template by property ID: ${(error as Error).message || 'Database delete failed'}`);
    }
  }

  /**
   * Check if receipt template exists for property
   */
  async existsForProperty(propertyId: string): Promise<boolean> {
    try {
      const query = `SELECT 1 FROM property_receipt_templates WHERE property_id = $1 LIMIT 1`;

      const result = await this.pool.query(query, [propertyId]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Failed to check if property receipt template exists: ${(error as Error).message || 'Database query failed'}`);
    }
  }

  /**
   * Map database row to PropertyReceiptTemplate object
   */
  private mapRowToPropertyReceiptTemplate(row: any): PropertyReceiptTemplate {
    return {
      id: row.id,
      propertyId: row.property_id,
      bankDetails: {
        bankName: row.bank_name,
        accountNumber: row.account_number,
        ifscCode: row.ifsc_code,
        accountHolderName: row.account_holder_name,
      },
      wallets: Array.isArray(row.wallets) ? row.wallets : (typeof row.wallets === 'string' ? JSON.parse(row.wallets || '[]') : (row.wallets || [])),
      paymentQRCodeUrl: row.payment_qr_code_url,
      signatureUrl: row.signature_url,
      watermarkUrl: row.watermark_url,
      additionalInfo: row.additional_info ? (typeof row.additional_info === 'string' ? JSON.parse(row.additional_info) : row.additional_info) : {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
}